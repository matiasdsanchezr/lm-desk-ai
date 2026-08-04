"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useSettingsStore } from "@/features/inference-settings/store/settings-store"
import { useChat } from "@ai-sdk/react"
import { type FileUIPart } from "ai"
import { useRouter } from "next/navigation"
import { createContext, ReactNode, use, useContext } from "react"
import { useShallow } from "zustand/shallow"
import { useChatStore } from "../store/chat-store"
import type { Chat } from "../types"

function useChatCompletionLogic(initialChatPromise?: Promise<Chat | null>) {
  const router = useRouter()
  const initialChat = initialChatPromise ? use(initialChatPromise) : null

  const { sessionId, includeReasoning, contextualPrompt } = useChatStore(
    useShallow((s) => ({
      sessionId: s.sessionId,
      includeReasoning: s.includeReasoning,
      contextualPrompt: s.contextualPrompt,
    }))
  )

  const { selectedFiles, images } = useFileExplorerStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      images: s.images,
    }))
  )

  const settings = useSettingsStore(
    useShallow((s) => ({
      modelConfig: s.modelConfig,
      systemPrompt: s.systemPrompt,
      temperature: s.temperature,
      topP: s.topP,
    }))
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
    messages: initialChat?.messages,
    onFinish: () => {
      router.refresh()
    },
  })

  const isStreaming = status === "streaming" || status === "submitted"

  const generateContent = () => {
    clearError()
    setMessages([])

    const imageFiles: FileUIPart[] = images.map((i) => ({
      type: "file",
      mediaType: i.mimeType,
      url: `data:${i.mimeType};base64,${i.base64}`,
    }))

    sendMessage(
      { text: contextualPrompt, files: imageFiles },
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
  }

  const sendFollowUp = (text: string) => {
    if (!text.trim() || isStreaming) return

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
  }

  return {
    initialChat,
    messages,
    error,
    isStreaming,
    setMessages,
    generateContent,
    sendFollowUp,
    stop,
  }
}

type ChatCompletionLogicReturn = ReturnType<typeof useChatCompletionLogic>

interface ChatCompletionContextType extends ChatCompletionLogicReturn {
  isExistingChat: boolean
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
  const chatLogic = useChatCompletionLogic(initialChatPromise)

  return (
    <ChatCompletionContext.Provider
      value={{
        ...chatLogic,
        isExistingChat: initialChatPromise !== undefined,
      }}
    >
      {children}
    </ChatCompletionContext.Provider>
  )
}

export function useChatCompletion() {
  const context = useContext(ChatCompletionContext)
  if (!context) {
    throw new Error(
      "useChatCompletionContext debe usarse dentro de un ChatCompletionProvider"
    )
  }
  return context
}
