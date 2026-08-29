"use client"

import { useFileExplorerStore } from "@/features/file-explorer"
import { useInferenceStore } from "@/features/inference/store/inference-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import type { FileContent } from "@/shared/services/file-service"
import { toDataUri } from "@/shared/utils/image-utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type FileUIPart } from "ai"
import { useRouter } from "next/navigation"
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { useChatStore } from "../store/chat-store"
import type { Chat, MyUIMessage } from "../types"

interface ChatCompletionContextType {
  chat?: Chat | null
  messages: MyUIMessage[]
  error: Error | undefined
  isStreaming: boolean
  setMessages: (messages: MyUIMessage[]) => void
  generateContent: (text: string) => void
  stop: () => void
}

const ChatCompletionContext = createContext<ChatCompletionContextType | null>(
  null
)

interface ChatCompletionProviderProps {
  children: ReactNode
  chatPromise?: Promise<Chat | null>
}

export function ChatCompletionProvider({
  children,
  chatPromise,
}: ChatCompletionProviderProps) {
  const router = useRouter()
  const chat = chatPromise ? use(chatPromise) : null

  const getInferenceConfig = useCallback(() => {
    const settings = useInferenceStore.getState()
    return {
      systemPrompt: settings.systemPrompt,
      provider: settings.modelConfig.provider,
      model: settings.modelConfig.model,
      temperature: settings.temperature,
      topP: settings.topP,
    }
  }, [])

  const {
    messages,
    status,
    error,
    setMessages,
    sendMessage,
    clearError,
    stop,
  } = useChat({
    id: chat?.id || "new-chat",
    messages: chat?.messages ?? [],
    resume: true,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest(data) {
        const { includeReasoningHistory } = useChatStore.getState()
        const { includeDependencies } = useFileExplorerStore.getState()

        return {
          body: {
            ...data,
            ...getInferenceConfig(),
            message: data.messages[data.messages.length - 1],
            includeReasoningHistory,
            includeDependencies,
          },
        }
      },
    }),
    onData: ({ data, type }: { type: string; data: unknown }) => {
      if (type === "data-chat-id") {
        const newChatId = (data as { id: string }).id
        router.push(`/chat/${newChatId}`)
      }
      if (type === "data-exportable-prompt") {
        const payload = data as {
          exportablePrompt: string
          files: FileContent[]
        }
        useChatStore.getState().setPrompts({
          contextualPrompt: "",
          exportablePrompt: payload.exportablePrompt,
        })
        if (payload.files?.length) {
          useFileExplorerStore.getState().setFileContents(payload.files)
        }
      }
    },
  })

  useEffect(() => {
    if (!chat) setMessages([])
  }, [chat, setMessages])

  const isStreaming = status === "streaming" || status === "submitted"

  const generateContent = useCallback(
    (text: string) => {
      clearError()
      if (!text.trim() || isStreaming) return

      const { attachedImages, includeContext } = useChatStore.getState()
      const { selectedFilePaths } = useFileExplorerStore.getState()
      const { crawledPages, selectedUrls } = useWebCrawlerStore.getState()

      // 1. Imágenes adjuntas
      const fileUIParts: FileUIPart[] = attachedImages.map((i) => ({
        type: "file",
        mediaType: i.mimeType || "image",
        url: toDataUri(i),
      }))

      // 2. Archivos y URLs de contexto adjuntos directamente a la UI part del mensaje
      const contextFiles: FileContent[] = []

      if (includeContext) {
        selectedFilePaths.forEach((path) => {
          contextFiles.push({ path })
        })

        const selectedWebPages = crawledPages.filter(
          (page) => selectedUrls.includes(page.url) && page.content
        )
        selectedWebPages.forEach((page) => {
          contextFiles.push({
            path: `[Web] ${page.title || page.url} (${page.url})`,
            content: page.content ?? "",
          })
        })
      }

      sendMessage({
        parts: [
          ...fileUIParts,
          ...(contextFiles.length > 0
            ? [
                {
                  type: "data-contextFiles" as const,
                  data: contextFiles,
                },
              ]
            : []),
          { type: "text", text },
        ],
      })
    },
    [clearError, sendMessage, isStreaming]
  )

  const contextValue = useMemo<ChatCompletionContextType>(
    () => ({
      chat,
      messages,
      error,
      isStreaming,
      setMessages,
      generateContent,
      stop,
    }),
    [chat, messages, error, isStreaming, setMessages, generateContent, stop]
  )

  return (
    <ChatCompletionContext.Provider value={contextValue}>
      {children}
    </ChatCompletionContext.Provider>
  )
}

export function useChatCompletion(): ChatCompletionContextType {
  const context = useContext(ChatCompletionContext)
  if (!context) {
    throw new Error(
      "useChatCompletion must be used within a ChatCompletionProvider"
    )
  }
  return context
}
