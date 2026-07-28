import { SidebarProvider } from "@/components/ui/sidebar"
import {
  listChats,
  loadChat,
} from "@/features/chat-history/actions/chat-history-actions"
import { ChatHistorySidebar } from "@/features/chat-history/components/chat-history-sidebar"
import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { notFound } from "next/navigation"

interface ExistingChatPageProps {
  params: Promise<{ chatId: string }>
}

export const dynamic = "force-dynamic"

export default async function ExistingChatPage({
  params,
}: ExistingChatPageProps) {
  const { chatId } = await params

  const [initialChat, treeStructure, responses] = await Promise.all([
    loadChat(chatId),
    generateTreeStructure(),
    listChats(),
  ])

  if (!initialChat.data || initialChat.error || responses.error) {
    notFound()
  }

  return (
    <section className="min-h-0 w-full flex-1">
      <SidebarProvider className="h-full items-stretch">
        <div className="flex h-full w-full items-stretch overflow-hidden">
          <ChatHistorySidebar savedChats={responses.data ?? []} />
          <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            <ChatWorkspace
              key={chatId}
              totalFiles={treeStructure.totalFiles}
              treeNodes={treeStructure.treeNodes}
              initialChat={initialChat.data}
            />
          </div>
        </div>
      </SidebarProvider>
    </section>
  )
}
