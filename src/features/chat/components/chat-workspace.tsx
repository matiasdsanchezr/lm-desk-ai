"use client"

import { useContextProcessor } from "../hooks/use-context-processor"
import { useChatCompletion } from "../providers/chat-completion-provider"
import { useChatStore } from "../store/chat-store"
import { ContextBuilder } from "./builder/context-builder"
import { GeneratedPrompt } from "./builder/generated-prompt"
import { PromptReviewer } from "./builder/prompt-reviewer"
import { ChatMobileHeader } from "./chat-mobile-header"
import { ChatThread } from "./thread/chat-thread"

export function ChatWorkspace() {
  const standalonePrompt = useChatStore((s) => s.standalonePrompt)
  const { initialChat, messages, error, isStreaming } = useChatCompletion()

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
