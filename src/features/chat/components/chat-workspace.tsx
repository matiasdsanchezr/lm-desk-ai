"use client"

import { useChatStore } from "@/features/chat/store/chat-store"
import { useChatCompletion } from "../providers/chat-completion-provider"
import { useContextProcessor } from "../hooks/use-context-processor"
import ChatMobileHeader from "./chat-mobile-header"
import { ChatThread } from "./chat-thread"
import { ContextBuilder } from "./context-builder"
import { GeneratedPrompt } from "./generated-prompt"
import { PromptReviewer } from "./prompt-reviewer"

export function ChatWorkspace() {
  const standalonePrompt = useChatStore((s) => s.standalonePrompt)
  const { initialChat, messages, error, isStreaming } =
    useChatCompletion()

  const { fetchFileState, handleFetchFileContents, isFetchingFiles } =
    useContextProcessor()

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
        <PromptReviewer disabled={messages.length > 0}>
          <GeneratedPrompt />
        </PromptReviewer>
      )}

      {(messages.length > 0 || error) && (
        <div className="space-y-4">
          <ChatThread />
        </div>
      )}
    </div>
  )
}
