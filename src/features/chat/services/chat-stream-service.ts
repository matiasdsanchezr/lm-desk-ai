import { streamContext } from "@/shared/lib/resumable-stream"
import { streamText } from "@/shared/services/inference-service/inference-service"
import { InferenceProviderEnum } from "@/shared/services/inference-service/schemas/provider-schema"
import { InferenceModelSchema } from "@/shared/services/inference-service/types/inference-model"
import {
  applyTransformScriptToModelMessages,
  createScriptTransformStream,
} from "@/shared/services/inference-service/utils/script-transformer"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  FilePart,
  generateId,
  pruneMessages,
  safeValidateUIMessages,
  TextPart,
  toUIMessageStream,
} from "ai"
import { revalidatePath, revalidateTag } from "next/cache"
import z from "zod"
import { ContextSource, dataSchemas, MyUIMessage } from "../types"
import { buildChatContext } from "../utils/chat-context-builder"
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
  includeDependencies: z.boolean().default(false),
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
    includeDependencies,
  } = body

  const inferenceModelResult = InferenceModelSchema.safeParse({
    model,
    provider,
  })
  if (!inferenceModelResult.success) {
    throw new Error("Configuración del modelo inválida")
  }

  let chat = await getChatById(id)
  const streamId = generateId()
  const validateUIMessagesResult = await safeValidateUIMessages({
    messages: [...(chat?.messages ?? []), message],
    dataSchemas,
  })
  if (!validateUIMessagesResult.success) {
    throw new Error(validateUIMessagesResult.error.message)
  }

  const uiMessages = validateUIMessagesResult.data as MyUIMessage[]
  let compiledSources: ContextSource[] = []
  let exportablePrompt = ""

  const lastMessage = uiMessages[uiMessages.length - 1]

  if (lastMessage && lastMessage.role === "user") {
    const sourcesPart = lastMessage.parts?.find(
      (p) => p.type === "data-contextSources"
    ) as { type: string; data: ContextSource[] } | undefined

    const initialSources = sourcesPart?.data ?? []

    if (initialSources.length > 0) {
      const userQuery =
        lastMessage.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p as { text: string }).text)
          .join("\n") ?? ""

      const contextResult = await buildChatContext({
        systemPrompt,
        task: userQuery,
        sources: initialSources,
        includeDependencies,
      })

      compiledSources = contextResult.sources
      exportablePrompt = contextResult.exportablePrompt

      lastMessage.parts = lastMessage.parts.map((p) => {
        if (p.type === "data-contextSources") {
          return { type: "data-contextSources", data: compiledSources }
        }
        return p
      }) as MyUIMessage["parts"]
    }
  }

  // Guardar estado inicial del chat
  if (!chat) {
    chat = await createChat({
      messages: uiMessages,
      activeStreamId: streamId,
    })
    revalidateTag("chat-list", "days")
    revalidatePath(`/chat`, "layout")
  } else {
    await updateChat(chat.id, {
      messages: uiMessages,
      activeStreamId: streamId,
    })
  }

  const modelMessages = await convertToModelMessages(uiMessages)

  // Inyectar el contexto compilado en los mensajes del modelo
  for (let i = 0; i < uiMessages.length; i++) {
    const uiMsg = uiMessages[i]
    const modelMsg = modelMessages[i]

    if (uiMsg.role === "user" && modelMsg) {
      const sourcesPart = uiMsg.parts?.find(
        (p) => p.type === "data-contextSources"
      ) as { type: string; data: ContextSource[] } | undefined

      const turnSources = sourcesPart?.data ?? []

      if (turnSources.length > 0) {
        const rawText =
          uiMsg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("\n") ?? ""

        const promptContextItems = turnSources.map((source) => ({
          path:
            source.type === "file"
              ? source.path
              : `[Web] ${source.title || source.url} (${source.url})`,
          content: source.content ?? "",
        }))

        const contextualPrompt = new PromptBuilder()
          .addContext(promptContextItems)
          .addTask(rawText)
          .buildContextAndTask()

        const content = modelMsg.content as string | (TextPart | FilePart)[]

        if (typeof content === "string") {
          modelMsg.content = contextualPrompt
        } else if (Array.isArray(content)) {
          const nonTextParts = content.filter((part) => part.type !== "text")
          modelMsg.content = [
            ...nonTextParts,
            { type: "text", text: contextualPrompt },
          ]
        }
      }
    }
  }

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
        writer.write({
          type: "data-chat-id",
          data: { id: chat.id },
          transient: true,
        })

        if (exportablePrompt) {
          writer.write({
            type: "data-exportable-prompt",
            data: {
              exportablePrompt,
              sources: compiledSources,
            },
            transient: true,
          })
        }

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

        writer.merge(
          toUIMessageStream({
            stream: result.stream,
            originalMessages: uiMessages,
            sendReasoning: true,
            onEnd: async ({ messages, responseMessage }) => {
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
  messages: MyUIMessage[],
  responseMessage: MyUIMessage
) {
  try {
    messages[messages.length - 1] = {
      ...responseMessage,
      id: generateId(),
    }

    await updateChat(id, {
      messages,
      activeStreamId: undefined,
    })
    revalidatePath(`/chat/${id}`)
  } catch (err) {
    console.error("[/api/chat] Error al guardar la sesión:", err)
  }
}
