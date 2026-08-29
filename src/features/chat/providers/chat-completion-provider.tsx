"use client"

import { useFileExplorerStore } from "@/features/file-explorer"
import { useInferenceStore } from "@/features/inference/store/inference-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import type { FileContent } from "@/shared/services/file-service"
import { toDataUri } from "@/shared/utils/image-utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai"
import { useRouter } from "next/navigation"
import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { useChatStore } from "../store/chat-store"
import type { Chat } from "../types"

interface ChatCompletionContextType {
  chat?: Chat | null
  messages: UIMessage[]
  error: Error | undefined
  isStreaming: boolean
  setMessages: (messages: UIMessage[]) => void
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
        const { includeReasoningHistory, includeContext } =
          useChatStore.getState()
        const { selectedFilePaths, includeDependencies } =
          useFileExplorerStore.getState()
        const { crawledPages, selectedUrls } = useWebCrawlerStore.getState()

        const webSources = includeContext
          ? crawledPages
              .filter((page) => selectedUrls.includes(page.url) && page.content)
              .map((page) => ({
                path: `[Web] ${page.title || page.url} (${page.url})`,
                content: page.content ?? "",
              }))
          : []

        return {
          body: {
            ...data,
            message: data.messages[data.messages.length - 1],
            ...getInferenceConfig(),
            includeReasoningHistory,
            includeContext,
            selectedFilePaths: includeContext ? selectedFilePaths : [],
            includeDependencies,
            webSources,
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

      const { attachedImages } = useChatStore.getState()

      const fileUIParts: FileUIPart[] = attachedImages.map((i) => ({
        type: "file",
        mediaType: i.mimeType || "image",
        url: toDataUri(i),
      }))

      sendMessage({
        parts: [...fileUIParts, { type: "text", text }],
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
