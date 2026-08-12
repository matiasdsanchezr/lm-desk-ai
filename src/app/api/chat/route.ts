import { streamContext } from "@/features/chat/lib/resumable-stream"
import { getChatById } from "@/features/chat/queries"
import {
  createChat,
  updateChat,
} from "@/features/chat/services/history-service"
import { streamText } from "@/shared/services/inference-service/inference-service"
import { InferenceProviderEnum } from "@/shared/services/inference-service/schemas/provider-schema"
import { InferenceModelSchema } from "@/shared/services/inference-service/types/inference-model"
import {
  applyTransformScript,
  applyTransformScriptToModelMessages,
  createScriptTransformStream,
} from "@/shared/services/inference-service/utils/script-transformer"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  pruneMessages,
  safeValidateUIMessages,
  toUIMessageStream,
} from "ai"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"

const ChatRequestBodySchema = z.object({
  id: z.string(),
  provider: InferenceProviderEnum,
  message: z.unknown(),
  model: z.string(),
  systemPrompt: z.string().default(""),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  selectedFilePaths: z.array(z.string()).optional(),
  includeReasoningHistory: z.boolean().default(true),
})

export async function POST(req: Request) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es un JSON válido" },
        { status: 400 }
      )
    }

    const parsedBody = ChatRequestBodySchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Cuerpo de solicitud inválido",
          details: parsedBody.error.issues,
        },
        { status: 400 }
      )
    }
    const {
      id,
      provider,
      message,
      model,
      systemPrompt,
      temperature,
      topP,
      selectedFilePaths,
      includeReasoningHistory,
    } = parsedBody.data

    const inferenceModelResult = InferenceModelSchema.safeParse({
      model,
      provider,
    })
    if (!inferenceModelResult.success) {
      return NextResponse.json(
        {
          error: "Configuración del modelo de inferencia inválida",
          details: inferenceModelResult.error.issues,
        },
        { status: 400 }
      )
    }

    const streamId = generateId()
    let chat = await getChatById(id)
    if (!chat) {
      chat = await createChat({
        messages: [],
        selectedFilePaths: selectedFilePaths || [],
        activeStreamId: streamId,
      })
      revalidateTag("chat-list", "days")
      revalidateTag(`chat-${chat.id}`, "days")
    }

    const validatedMessages = await safeValidateUIMessages({
      messages: [...chat.messages, message],
    })
    if (!validatedMessages.success) {
      throw new Error(validatedMessages.error.message)
    }

    const modelMessages = await convertToModelMessages(validatedMessages.data)
    const prunedMessages = includeReasoningHistory
      ? modelMessages
      : pruneMessages({
          messages: modelMessages,
          reasoning: "all",
        })
    const transformedMessages = await applyTransformScriptToModelMessages(
      prunedMessages,
      "pre-transform.js"
    )

    return createUIMessageStreamResponse({
      status: 200,
      statusText: "OK",
      stream: createUIMessageStream({
        execute({ writer }) {
          const result = streamText({
            inferenceModel: inferenceModelResult.data,
            instructions: systemPrompt,
            messages: transformedMessages,
            temperature,
            topP,
            experimental_transform: [
              createScriptTransformStream("post-transform.js"),
            ],
          })

          writer.write({
            type: "data-chat-id",
            data: { id: chat.id },
            transient: true,
          })

          writer.merge(
            toUIMessageStream({
              stream: result.stream,
              originalMessages: validatedMessages.data,
              sendReasoning: true,
              onEnd: async ({ messages, responseMessage }) => {
                try {
                  const parts = responseMessage.parts
                  let textContent = ""
                  for (let i = 0; i < parts.length; i++) {
                    const part = parts[i]
                    if (part.type === "text" && part.text) {
                      textContent += (textContent ? "\n\n" : "") + part.text
                    }
                  }

                  if (!textContent) {
                    await updateChat(chat.id, { messages })
                    revalidateTag("chat-list", "days")
                    revalidateTag(`chat-${chat.id}`, "days")
                    revalidatePath(`/chat/${chat.id}`)
                    return
                  }

                  const transformedText = await applyTransformScript(
                    textContent,
                    "post-transform.js"
                  )

                  messages[messages.length - 1] = {
                    ...responseMessage,
                    id: generateId(),
                    parts: parts.map((p) =>
                      p.type === "text" ? { ...p, text: transformedText } : p
                    ),
                  }

                  await updateChat(chat.id, { messages })
                  revalidateTag("chat-list", "days")
                  revalidateTag(`chat-${chat.id}`, "days")
                  revalidatePath(`/chat/${chat.id}`)
                } catch (err) {
                  console.error(
                    "[/api/chat] Error al procesar o guardar la sesión:",
                    err
                  )
                }
              },
              onError: (error: unknown) => {
                console.error("[/api/chat] Error en el stream:", error)
                return "Error al generar la respuesta"
              },
            })
          )
        },
      }),
      async consumeSseStream({ stream }) {
        try {
          await streamContext.createNewResumableStream(streamId, () => stream)
        } catch (error) {
          console.error(error)
        }
      },
    })
  } catch (error) {
    console.error("[/api/chat] Error no controlado:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
