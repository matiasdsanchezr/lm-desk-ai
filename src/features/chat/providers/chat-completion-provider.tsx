"use client"

import { useFileExplorerStore } from "@/features/file-explorer"
import { useInferenceStore } from "@/features/inference/store/inference-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import { toDataUri } from "@/shared/utils/image-utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type FileUIPart } from "ai"
import { useRouter } from "next/navigation"
import {
  createContext,
  use,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useChatStore } from "../store/chat-store"
import type { Chat, ContextSource, FileSource, MyUIMessage } from "../types"
import { buildContextSourcesPayload } from "../utils/chat-utils"

interface ChatCompletionContextType {
  chat?: Chat | null
  chatId: string
  messages: MyUIMessage[]
  error?: Error
  isStreaming: boolean
  setMessages: (
    messages: MyUIMessage[] | ((messages: MyUIMessage[]) => MyUIMessage[])
  ) => void
  generateContent: (text: string) => void
  stop: () => void
}

const ChatCompletionContext = createContext<ChatCompletionContextType | null>(
  null
)

interface ChatCompletionProviderProps {
  children: ReactNode
  chatId: string
  chatPromise?: Promise<Chat | null>
}

export function ChatCompletionProvider({
  children,
  chatId,
  chatPromise,
}: ChatCompletionProviderProps) {
  const router = useRouter()

  const chat = chatPromise ? use(chatPromise) : null
  const sessionId = chat?.id ?? chatId

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

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest(data) {
          const { includeReasoningHistory } = useChatStore.getState()
          const { includeDependencies } = useFileExplorerStore.getState()

          return {
            body: {
              ...data,
              id: sessionId,
              ...getInferenceConfig(),
              message: data.messages[data.messages.length - 1],
              includeReasoningHistory,
              includeDependencies,
            },
          }
        },
      }),
    [sessionId, getInferenceConfig]
  )

  const {
    messages,
    status,
    error,
    setMessages,
    sendMessage,
    clearError,
    stop,
  } = useChat({
    id: sessionId,
    messages: chat?.messages ?? [],
    resume: true,
    transport,
    onFinish: () => {
      router.refresh()
    },
    onData: ({ data, type }: { type: string; data: unknown }) => {
      if (type === "data-exportable-prompt") {
        const payload = data as {
          exportablePrompt: string
          sources?: ContextSource[]
        }

        useChatStore.getState().setPrompts({
          contextualPrompt: "",
          exportablePrompt: payload.exportablePrompt,
        })

        const localFiles =
          payload.sources
            ?.filter((s): s is FileSource => s.type === "file")
            .map((f) => ({
              path: f.path,
              content: f.content,
              error: f.error,
              dependencies: f.dependencies,
              language: f.language,
            })) ?? []

        if (localFiles.length > 0) {
          useFileExplorerStore.getState().setFileContents(localFiles)
        }
      }
    },
  })

  const isStreaming = status === "streaming" || status === "submitted"

  const generateContent = useCallback(
    (text: string) => {
      clearError()
      if (!text.trim() || isStreaming) return

      const { attachedImages, includeContext } = useChatStore.getState()
      const { selectedFilePaths } = useFileExplorerStore.getState()
      const { crawledPages, selectedUrls } = useWebCrawlerStore.getState()

      const fileUIParts: FileUIPart[] = attachedImages.map((i) => ({
        type: "file",
        mediaType: i.mimeType || "image",
        url: toDataUri(i),
      }))

      const contextSources = buildContextSourcesPayload({
        includeContext,
        selectedFilePaths,
        crawledPages,
        selectedUrls,
      })

      const dataParts =
        contextSources.length > 0
          ? [
              {
                type: "data-contextSources" as const,
                data: contextSources,
              },
            ]
          : []

      sendMessage({
        parts: [...fileUIParts, ...dataParts, { type: "text", text }],
      })
    },
    [clearError, isStreaming, sendMessage]
  )

  const contextValue = useMemo<ChatCompletionContextType>(
    () => ({
      chat,
      chatId: sessionId,
      messages,
      error,
      isStreaming,
      setMessages,
      generateContent,
      stop,
    }),
    [
      chat,
      sessionId,
      messages,
      error,
      isStreaming,
      setMessages,
      generateContent,
      stop,
    ]
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
