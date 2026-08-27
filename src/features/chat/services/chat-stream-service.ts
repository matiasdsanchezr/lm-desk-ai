import { streamContext } from "@/shared/lib/resumable-stream"
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
  UIDataTypes,
  UIMessage,
  UITools,
} from "ai"
import { revalidatePath, revalidateTag } from "next/cache"
import z from "zod"
import { createChat, getChatById, updateChat } from "./history-service"

export const ChatRequestBodySchema = z.object({
  id: z.string(),
  provider: InferenceProviderEnum,
  message: z.unknown(),
  model: z.string(),
  systemPrompt: z.string().default(""),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  includeReasoningHistory: z.boolean().default(true),
})

export type ChatRequestBody = z.infer<typeof ChatRequestBodySchema>

export async function handleChatRequest(body: ChatRequestBody) {
  const {
    id,
    provider,
    message,
    model,
    systemPrompt,
    temperature,
    topP,
    includeReasoningHistory,
  } = body

  // Validación de modelo
  const inferenceModelResult = InferenceModelSchema.safeParse({
    model,
    provider,
  })
  if (!inferenceModelResult.success) {
    throw new Error("Configuración del modelo inválida")
  }

  let chat = await getChatById(id)
  const streamId = generateId()
  const validatedMessages = await safeValidateUIMessages({
    messages: [...(chat?.messages ?? []), message],
  })
  if (!validatedMessages.success) {
    throw new Error(validatedMessages.error.message)
  }

  if (!chat) {
    chat = await createChat({
      messages: validatedMessages.data,
      activeStreamId: streamId,
    })
    revalidateTag("chat-list", "days")
    revalidatePath(`/chat`, "layout")
  }

  const modelMessages = await convertToModelMessages(validatedMessages.data)
  const prunedMessages = includeReasoningHistory
    ? modelMessages
    : pruneMessages({ messages: modelMessages, reasoning: "all" })

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
          maxOutputTokens: 60000,
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
              // Lógica de persistencia final (igual que antes, extraída)
              await persistChatAfterStream(chat.id, messages, responseMessage)
            },
            onError: (error) => {
              console.error("[/api/chat] Error en stream:", error)
              return "Error al generar la respuesta"
            },
          })
        )
      },
    }),
    async consumeSseStream({ stream }) {
      await streamContext.createNewResumableStream(streamId, () => stream)
    },
  })
}

async function persistChatAfterStream(
  id: string,
  messages: UIMessage<unknown, UIDataTypes, UITools>[],
  responseMessage: UIMessage<unknown, UIDataTypes, UITools>
) {
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
      await updateChat(id, { messages })
      revalidatePath(`/chat/${id}`)
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

    await updateChat(id, {
      messages,
      activeStreamId: undefined,
    })
    revalidatePath(`/chat/${id}`)
  } catch (err) {
    console.error("[/api/chat] Error al procesar o guardar la sesión:", err)
  }
}
