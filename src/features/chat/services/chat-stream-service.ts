import { streamContext } from "@/shared/lib/resumable-stream"
import type { FileContent } from "@/shared/services/file-service"
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
  ImagePart,
  pruneMessages,
  safeValidateUIMessages,
  TextPart,
  toUIMessageStream,
} from "ai"
import { revalidatePath, revalidateTag } from "next/cache"
import z from "zod"
import { dataSchemas, MyUIMessage } from "../types"
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
  let localFiles: FileContent[] = []
  let exportablePrompt = ""

  // Obtenemos el último mensaje enviado por el usuario
  const lastMessage = uiMessages[uiMessages.length - 1]

  if (lastMessage && lastMessage.role === "user") {
    const contextFilesPart = lastMessage.parts?.find(
      (p) => p.type === "data-contextFiles"
    )

    const initialFiles = contextFilesPart?.data ?? []

    if (initialFiles.length > 0) {
      const userQuery =
        lastMessage.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("\n") ?? ""

      // Separamos archivos locales de fuentes web
      const selectedFilePaths = initialFiles
        .filter((f) => !f.path.startsWith("[Web]"))
        .map((f) => f.path)

      const webSources = initialFiles
        .filter((f) => f.path.startsWith("[Web]"))
        .map((f) => ({
          path: f.path,
          content: f.content ?? "",
        }))

      // Compilamos y leemos el contenido real de los archivos en el servidor
      const context = await buildChatContext({
        systemPrompt,
        task: userQuery,
        selectedFilePaths,
        includeDependencies,
        webSources,
      })

      localFiles = context.files
      exportablePrompt = context.exportablePrompt

      // Enriquecemos la parte de datos del mensaje con los contenidos resueltos
      const mergedEnrichedFiles: FileContent[] = [
        ...context.files,
        ...webSources,
      ]

      lastMessage.parts = lastMessage.parts.map((p) =>
        p.type === "data-contextFiles"
          ? { type: "data-contextFiles", data: mergedEnrichedFiles }
          : p
      ) as MyUIMessage["parts"]
    }
  }

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

  // Reconstruir el contenido contextual para cada turno de usuario que posea snapshot de archivos
  for (let i = 0; i < uiMessages.length; i++) {
    const uiMsg = uiMessages[i]
    const modelMsg = modelMessages[i]

    if (uiMsg.role === "user" && modelMsg) {
      const filesPart = uiMsg.parts?.find(
        (p) => p.type === "data-contextFiles"
      ) as { type: string; data: FileContent[] } | undefined
      const turnFiles = filesPart?.data ?? []

      if (turnFiles.length > 0) {
        const rawText =
          uiMsg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("\n") ?? ""

        const contextualPrompt = new PromptBuilder()
          .addContext(turnFiles)
          .addTask(rawText)
          .buildContextAndTask()

        const content = modelMsg.content as
          | string
          | (TextPart | ImagePart | FilePart)[]

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
