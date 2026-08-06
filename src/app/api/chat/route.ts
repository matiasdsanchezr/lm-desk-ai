import { saveChat, updateChat } from "@/features/chat/actions"
import { getChatById } from "@/features/chat/queries"

import { streamText } from "@/shared/services/inference-service/inference-service"
import { InferenceProviderEnum } from "@/shared/services/inference-service/schemas/provider-schema"
import { InferenceModelSchema } from "@/shared/services/inference-service/types/inference-model"
import {
  applyPostProcessorScript,
  postProcessorTransform,
} from "@/shared/services/inference-service/utils/post-processor"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  toUIMessageStream,
  UIMessage,
} from "ai"
import { NextResponse } from "next/server"
import { string, z } from "zod"

const ChatRequestBodySchema = z.object({
  id: string(),
  provider: InferenceProviderEnum,
  messages: z.array(z.unknown()),
  model: z.string(),
  instructions: z.string().default(""),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  selectedFilePaths: z.array(z.string()).optional(),
  includeReasoning: z.boolean().default(true),
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
      messages,
      model,
      instructions,
      temperature,
      topP,
      selectedFilePaths,
      includeReasoning,
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

    const validatedMessages = await safeValidateUIMessages({
      messages,
    })
    if (!validatedMessages.success) {
      throw new Error(validatedMessages.error.message)
    }
    const modelMessages = await convertToModelMessages(validatedMessages.data)

    return createUIMessageStreamResponse({
      status: 200,
      statusText: "OK",
      stream: createUIMessageStream({
        execute({ writer }) {
          const result = streamText({
            inferenceModel: inferenceModelResult.data,
            instructions: instructions,
            messages: modelMessages.map((m) =>
              m.role === "user"
                ? {
                    ...m,
                    content:
                      typeof m.content === "string"
                        ? m.content.replace(/ /g, "¶")
                        : m.content.map((c) =>
                            c.type === "text"
                              ? { ...c, text: c.text.replace(/ /g, "¶") }
                              : c
                          ),
                  }
                : m
            ),
            temperature,
            topP,
            experimental_transform: [postProcessorTransform()],
          })

          let chatId = id
          if (!chatId || chatId == "new-chat") {
            chatId = `session-${Date.now()}`
            writer.write({
              type: "data-chat-id",
              data: { id: chatId },
              transient: true,
            })
          }

          writer.merge(
            toUIMessageStream({
              stream: result.stream,
              originalMessages: validatedMessages.data,
              sendReasoning: includeReasoning,
              onEnd: async ({ messages, responseMessage }) => {
                try {
                  let textContent = ""
                  for (const part of responseMessage.parts) {
                    if (part.type === "text") {
                      textContent += (textContent ? "\n\n" : "") + part.text
                    }
                  }

                  if (textContent) {
                    const processedText =
                      await applyPostProcessorScript(textContent)

                    const finalMessages: UIMessage[] = messages.map((msg) => {
                      if (
                        msg.id === responseMessage.id &&
                        Array.isArray(msg.parts)
                      ) {
                        return {
                          ...msg,
                          parts: msg.parts.map((p) =>
                            p.type === "text"
                              ? { ...p, text: processedText }
                              : p
                          ),
                        }
                      }
                      return msg
                    })
                    if (chatId) {
                      const existingChat = await getChatById(chatId)
                      if (existingChat) {
                        await updateChat(chatId, {
                          messages: finalMessages,
                        })
                      } else {
                        await saveChat({
                          id: chatId,
                          selectedFilePaths: selectedFilePaths || [],
                          messages: finalMessages,
                        })
                      }
                    } else {
                      const result = await saveChat({
                        selectedFilePaths: selectedFilePaths || [],
                        messages: messages,
                      })
                      writer.write({
                        type: "data-chat-id",
                        data: { id: result.data?.id },
                        transient: true,
                      })
                    }
                  }
                } catch (err) {
                  console.error(
                    "[/api/chat] Error al procesar o guardar el chat dinámicamente:",
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
    })
  } catch (error) {
    console.error("[/api/chat] Error no controlado:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
