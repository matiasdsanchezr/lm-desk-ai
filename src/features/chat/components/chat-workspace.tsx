"use client"

import { useChatStore } from "../store/chat-store"
import { GeneratedPrompt } from "./builder/generated-prompt"
import { ChatMobileHeader } from "./chat-mobile-header"
import { ChatComposer } from "./composer/chat-composer"
import { ChatThread } from "./thread/chat-thread"

export function ChatWorkspace() {
  const exportablePrompt = useChatStore((s) => s.exportablePrompt)

  return (
    <div className="relative mx-auto flex h-full w-full max-w-350 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 pb-2 md:hidden">
        <ChatMobileHeader />
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatThread />
      </section>

      <footer className="relative shrink-0 pt-2 pb-1 sm:pb-2">
        <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-linear-to-t from-background to-transparent" />

        {Boolean(exportablePrompt) && (
          <div className="mb-2 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <GeneratedPrompt />
          </div>
        )}

        <ChatComposer />
      </footer>
    </div>
  )
}
