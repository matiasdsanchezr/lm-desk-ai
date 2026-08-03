import { listChats } from "@/features/chat/actions/chat-history-actions"
import { ChatHistorySidebar } from "@/features/chat/components/history/chat-history-sidebar"
import { ChatHistorySidebarSkeleton } from "@/features/chat/components/history/chat-history-sidebar-skeleton"
import { loadPrompts } from "@/features/settings/actions/prompt"
import { SettingsDrawer } from "@/features/settings/components/settings-drawer"
import { SettingsDrawerSkeleton } from "@/features/settings/components/settings-drawer-skeleton"
import { SidebarProvider } from "@/shared/components/ui/sidebar"
import { Metadata } from "next"
import React, { Suspense } from "react"

export const metadata: Metadata = {
  title: "Chat - LM Desk",
  description: "Generar consultas para LLMs sobre tus archivos locales",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const savedChatsPromise = listChats()
  const initialPromptsPromise = loadPrompts()

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-background font-sans selection:bg-primary/10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />

      <Suspense fallback={<SettingsDrawerSkeleton />}>
        <SettingsDrawer initialPromptsPromise={initialPromptsPromise} />
      </Suspense>

      <section className="min-h-0 w-full flex-1">
        <SidebarProvider defaultOpen={false} className="h-full items-stretch">
          <div className="flex h-full w-full items-stretch overflow-hidden">
            <Suspense fallback={<ChatHistorySidebarSkeleton />}>
              <ChatHistorySidebar savedChatsPromise={savedChatsPromise} />
            </Suspense>
            <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </div>
          </div>
        </SidebarProvider>
      </section>
    </main>
  )
}
