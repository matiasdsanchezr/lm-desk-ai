import { ContextBuilder } from "./builder/context-builder"
import { GeneratedPrompt } from "./builder/generated-prompt"
import { PromptReviewer } from "./builder/prompt-reviewer"
import { ChatMobileHeader } from "./chat-mobile-header"
import { ChatThread } from "./thread/chat-thread"

export function ChatWorkspace() {
  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-4 md:gap-6">
      <ChatMobileHeader />
      <ContextBuilder />
      <PromptReviewer>
        <GeneratedPrompt />
      </PromptReviewer>
      <div className="space-y-4">
        <ChatThread />
      </div>
    </div>
  )
}
