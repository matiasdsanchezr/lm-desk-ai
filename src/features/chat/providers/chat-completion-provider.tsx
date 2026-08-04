"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useSettingsStore } from "@/features/inference-settings/store/settings-store"
import { useChat } from "@ai-sdk/react"
import { type FileUIPart, type UIMessage } from "ai"
import { useRouter } from "next/navigation"
import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useContext,
  useMemo,
} from "react"
import { useChatStore } from "../store/chat-store"
import type { Chat } from "../types"

interface ChatCompletionContextType {
  initialChat?: Chat | null
  messages: UIMessage[]
  error: Error | undefined
  isStreaming: boolean
  isExistingChat: boolean
  setMessages: (messages: UIMessage[]) => void
  generateContent: () => void
  sendFollowUp: (text: string) => void
  stop: () => void
}

const ChatCompletionContext = createContext<ChatCompletionContextType | null>(
  null
)

interface ChatCompletionProviderProps {
  children: ReactNode
  initialChatPromise?: Promise<Chat | null>
}

export function ChatCompletionProvider({
  children,
  initialChatPromise,
}: ChatCompletionProviderProps) {
  const router = useRouter()
  const initialChat = initialChatPromise ? use(initialChatPromise) : null
  const sessionId = useChatStore((s) => s.sessionId)
  const isExistingChat = initialChatPromise !== undefined

  const handleFinish = useCallback(() => {
    router.refresh()
  }, [router])

  const {
    messages,
    status,
    error,
    setMessages,
    sendMessage,
    clearError,
    stop,
  } = useChat({
    id: initialChat?.id || sessionId,
    messages: initialChat?.messages,
    onFinish: handleFinish,
  })

  const isStreaming = status === "streaming" || status === "submitted"

  const generateContent = useCallback(() => {
    clearError()
    setMessages([])

    const { contextualPrompt } = useChatStore.getState()
    const { images, selectedFiles } = useFileExplorerStore.getState()
    const settings = useSettingsStore.getState()

    const imageFiles: FileUIPart[] = images.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: i.base64.startsWith("data:")
        ? i.base64
        : `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      {
        text: contextualPrompt,
        files: imageFiles.length > 0 ? imageFiles : undefined,
      },
      {
        body: {
          system: settings.systemPrompt,
          provider: settings.modelConfig.provider,
          model: settings.modelConfig.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFiles,
        },
      }
    )
  }, [clearError, setMessages, sendMessage])

  const sendFollowUp = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming) return

      const { includeReasoning } = useChatStore.getState()
      const { selectedFiles } = useFileExplorerStore.getState()
      const settings = useSettingsStore.getState()

      sendMessage(
        { text },
        {
          body: {
            system: settings.systemPrompt,
            provider: settings.modelConfig.provider,
            model: settings.modelConfig.model,
            temperature: settings.temperature,
            topP: settings.topP,
            selectedFiles,
            includeReasoning,
          },
        }
      )
    },
    [isStreaming, sendMessage]
  )

  const contextValue = useMemo<ChatCompletionContextType>(
    () => ({
      initialChat,
      messages,
      error,
      isStreaming,
      isExistingChat,
      setMessages,
      generateContent,
      sendFollowUp,
      stop,
    }),
    [
      initialChat,
      messages,
      error,
      isStreaming,
      isExistingChat,
      setMessages,
      generateContent,
      sendFollowUp,
      stop,
    ]
  )

  return (
    <ChatCompletionContext.Provider value={contextValue}>
      {children}
    </ChatCompletionContext.Provider>
  )
}

export function useChatCompletion() {
  const context = useContext(ChatCompletionContext)
  if (!context) {
    throw new Error(
      "useChatCompletion debe usarse dentro de un ChatCompletionProvider"
    )
  }

  return context
}
