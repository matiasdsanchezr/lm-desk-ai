"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useInferenceStore } from "@/features/inference/store/inference-store"
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
  generateContent: (text: string, includeContext?: boolean) => void
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
    messages: chat?.messages || [],
    resume: true,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest(data) {
        const { selectedFilePaths } = useFileExplorerStore.getState()
        const { includeReasoningHistory } = useChatStore.getState()
        return {
          body: {
            ...data,
            message: data.messages[data.messages.length - 1],
            ...getInferenceConfig(),
            selectedFilePaths,
            includeReasoningHistory,
          },
        }
      },
    }),
    onData: ({ data, type }: { type: string; data: unknown }) => {
      if (type == "data-chat-id") {
        const newChatId = (data as { id: string }).id
        router.push(`/chat/${newChatId}`)
      }
    },
  })

  useEffect(() => {
    if (!chat) setMessages([])
  }, [chat, setMessages])

  const isStreaming = status === "streaming" || status === "submitted"

  const generateContent = useCallback(
    (text: string, includeContext = true) => {
      clearError()

      if (!text.trim() || isStreaming) return

      if (!includeContext) {
        sendMessage({ text })
        return
      }

      const { imageFiles } = useFileExplorerStore.getState()

      const fileUIParts: FileUIPart[] = imageFiles.map((i) => ({
        type: "file",
        mediaType: i.mimeType || "image",
        url: i.base64.startsWith("data:")
          ? i.base64
          : `data:${i.mimeType};base64,${i.base64}`,
      }))

      sendMessage({
        parts: [...fileUIParts, { type: "text", text }],
      })
    },
    [clearError, sendMessage, isStreaming]
  )

  const contextValue = useMemo<ChatCompletionContextType>(
    () => ({
      chat: chat,
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
