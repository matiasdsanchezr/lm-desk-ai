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
  useEffect,
  useMemo,
} from "react"
import { useChatStore } from "../store/chat-store"
import type { Chat } from "../types"

interface ChatCompletionContextType {
  initialChat?: Chat | null
  messages: UIMessage[]
  error: Error | undefined
  isStreaming: boolean
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
  chatId?: string
}

export function ChatCompletionProvider({
  children,
  chatId,
  initialChatPromise,
}: ChatCompletionProviderProps) {
  const router = useRouter()
  const initialChat = initialChatPromise ? use(initialChatPromise) : null
  // const [currentChatId, setCurrentChatId] = useState(chatId || "new-chat")

  const {
    messages,
    status,
    error,
    setMessages,
    sendMessage,
    clearError,
    stop,
  } = useChat({
    id: chatId || "new-chat",
    messages: initialChat?.messages || [],
    resume: true,
    onData: ({ data, type }: { type: string; data: unknown }) => {
      if (type == "data-chat-id") {
        const newChatId = (data as { id: string }).id
        router.push(`/chat/${newChatId}`)
      }
    },
  })

  useEffect(() => {
    if (!initialChat) setMessages([])
  }, [initialChat, setMessages])

  const isStreaming = status === "streaming" || status === "submitted"

  const generateContent = useCallback(() => {
    clearError()
    setMessages([])

    const { contextualPrompt } = useChatStore.getState()
    const { imageFiles, selectedFilePaths } = useFileExplorerStore.getState()
    const settings = useSettingsStore.getState()
    const fileUIParts: FileUIPart[] = imageFiles.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: i.base64.startsWith("data:")
        ? i.base64
        : `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      {
        text: contextualPrompt,
        files: fileUIParts.length > 0 ? fileUIParts : undefined,
      },
      {
        body: {
          instructions: settings.systemPrompt,
          provider: settings.modelConfig.provider,
          model: settings.modelConfig.model,
          temperature: settings.temperature,
          topP: settings.topP,
          selectedFilePaths: selectedFilePaths,
        },
      }
    )
  }, [clearError, setMessages, sendMessage])

  const sendFollowUp = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming) return

      const { includeReasoning } = useChatStore.getState()
      const { selectedFilePaths } = useFileExplorerStore.getState()
      const settings = useSettingsStore.getState()

      sendMessage(
        { text },
        {
          body: {
            instructions: settings.systemPrompt,
            provider: settings.modelConfig.provider,
            model: settings.modelConfig.model,
            temperature: settings.temperature,
            topP: settings.topP,
            selectedFilePaths,
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

export function useChatCompletion(): ChatCompletionContextType {
  const context = useContext(ChatCompletionContext)
  if (!context) {
    throw new Error(
      "useChatCompletion must be used within a ChatCompletionProvider"
    )
  }
  return context
}
