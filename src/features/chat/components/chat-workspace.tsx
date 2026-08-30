"use client"

import { useChatStore } from "../store/chat-store"
import { ChatComposer } from "./composer/chat-composer"
import { GeneratedPrompt } from "./generated-prompt"
import { ChatThread } from "./thread/chat-thread"

export function ChatWorkspace() {
  const exportablePrompt = useChatStore((s) => s.exportablePrompt)

  return (
    <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatThread />
      </section>

      <footer className="relative shrink-0 px-3 pb-3 sm:px-4 sm:pb-4 md:px-6">
        <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-linear-to-t from-background to-transparent" />

        <div className="mx-auto w-full max-w-5xl">
          {Boolean(exportablePrompt) && (
            <div className="mb-2 shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <GeneratedPrompt />
            </div>
          )}

          <ChatComposer />
        </div>
      </footer>
    </div>
  )
}
