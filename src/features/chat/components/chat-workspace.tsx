"use client"

import { useChatStore } from "@/features/chat/store/chat-store"
import { SavedChat } from "@/features/chat/types"
import { notFound } from "next/navigation"
import { useChatCompletion } from "../hooks/use-chat-completion"
import { useContextProcessor } from "../hooks/use-context-processor"
import ChatMobileHeader from "./chat-mobile-header"
import { ChatThread } from "./chat-thread"
import { ContextBuilder } from "./context-builder"
import { GeneratedPrompt } from "./generated-prompt"
import { PromptReviewer } from "./prompt-reviewer"

interface ChatWorkspaceProps {
  initialChatPromise?: Promise<SavedChat | null>
}

export function ChatWorkspace({ initialChatPromise }: ChatWorkspaceProps) {
  const standalonePrompt = useChatStore((s) => s.standalonePrompt)

  const { fetchFileState, handleFetchFileContents, isFetchingFiles } =
    useContextProcessor()

  const {
    initialChat,
    messages,
    error,
    isStreaming,
    setMessages,
    generateContent,
    sendFollowUp,
    stop,
  } = useChatCompletion(initialChatPromise)
  if (initialChatPromise && !initialChat) {
    notFound()
  }

  const isReadyToReview = Boolean(standalonePrompt)
  const isDisabled = isFetchingFiles || isStreaming || isReadyToReview

  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-4 md:gap-6">
      <ChatMobileHeader title={initialChat?.title || "Nueva Sesión"} />

      <ContextBuilder
        isDisabled={isDisabled}
        isFetchingFiles={isFetchingFiles}
        isReadyToReview={isReadyToReview}
        fetchFileState={fetchFileState}
        handleFetchFileContents={handleFetchFileContents}
      />

      {isReadyToReview && (
        <PromptReviewer
          disabled={messages.length > 0}
          isStreaming={isStreaming}
          onGenerateContent={generateContent}
          stop={stop}
        >
          <GeneratedPrompt />
        </PromptReviewer>
      )}

      {(messages.length > 0 || error) && (
        <div className="space-y-4">
          <ChatThread
            messages={messages}
            error={error}
            isStreaming={isStreaming}
            onSendFollowUp={sendFollowUp}
            setMessages={setMessages}
          />
        </div>
      )}
    </div>
  )
}
