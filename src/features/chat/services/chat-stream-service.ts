import { streamContext } from "@/shared/lib/resumable-stream"
import { FileContent } from "@/shared/services/file-service"
import { streamText } from "@/shared/services/inference-service/inference-service"
import { InferenceProviderEnum } from "@/shared/services/inference-service/schemas/provider-schema"
import { InferenceModelSchema } from "@/shared/services/inference-service/types/inference-model"
import {
  applyTransformScriptToModelMessages,
  createScriptTransformStream,
} from "@/shared/services/inference-service/utils/script-transformer"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  FilePart,
  generateId,
  ImagePart,
  pruneMessages,
  safeValidateUIMessages,
  TextPart,
  toUIMessageStream,
  UIDataTypes,
  UIMessage,
  UITools,
} from "ai"
import { revalidatePath, revalidateTag } from "next/cache"
import z from "zod"
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
  includeContext: z.boolean().default(false),
  selectedFilePaths: z.array(z.string()).default([]),
  includeDependencies: z.boolean().default(false),
  webSources: z
    .array(z.object({ path: z.string(), content: z.string() }))
    .default([]),
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
    includeContext,
    selectedFilePaths,
    includeDependencies,
    webSources,
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
  } else {
    await updateChat(chat.id, { activeStreamId: streamId })
  }

  let localFiles: FileContent[] = []
  let exportablePrompt = ""
  let contextualPromptContent: string | null = null

  if (
    includeContext &&
    (selectedFilePaths.length > 0 || webSources.length > 0)
  ) {
    const lastUserMsg =
      validatedMessages.data[validatedMessages.data.length - 1]
    const userQuery =
      lastUserMsg?.parts
        ?.filter((p) => p.type === "text")
        .map((p) => (p as { text: string }).text)
        .join("\n") ?? ""

    const contextResult = await buildChatContext({
      systemPrompt,
      task: userQuery,
      selectedFilePaths,
      includeDependencies,
      webSources,
    })

    localFiles = contextResult.files
    exportablePrompt = contextResult.exportablePrompt
    contextualPromptContent = contextResult.contextualPrompt
  }

  const modelMessages = await convertToModelMessages(validatedMessages.data)
  const prunedMessages = includeReasoningHistory
    ? modelMessages
    : pruneMessages({ messages: modelMessages, reasoning: "all" })

  if (contextualPromptContent && prunedMessages.length > 0) {
    const lastMessage = prunedMessages[prunedMessages.length - 1]
    const content = lastMessage.content as
      | string
      | (TextPart | ImagePart | FilePart)[]

    if (typeof content === "string") {
      lastMessage.content = contextualPromptContent
    } else if (Array.isArray(content)) {
      const nonTextParts = content.filter((part) => part.type !== "text")
      lastMessage.content = [
        ...nonTextParts,
        { type: "text", text: contextualPromptContent },
      ]
    }
  }

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
              files: localFiles,
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
            originalMessages: validatedMessages.data,
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
  messages: UIMessage<unknown, UIDataTypes, UITools>[],
  responseMessage: UIMessage<unknown, UIDataTypes, UITools>
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
