import { SidebarProvider } from "@/components/ui/sidebar"
import {
  listChats,
  loadChat,
} from "@/features/chat-history/actions/chat-history-actions"
import { ChatHistorySidebar } from "@/features/chat-history/components/chat-history-sidebar"
import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { notFound } from "next/navigation"
import { Suspense } from "react"

interface ExistingChatPageProps {
  params: Promise<{ chatId: string }>
}

export default function ExistingChatPage({ params }: ExistingChatPageProps) {
  return (
    <section className="min-h-0 w-full flex-1">
      <SidebarProvider className="h-full items-stretch">
        <div className="flex h-full w-full items-stretch overflow-hidden">
          <Suspense>
            <SidebarWrapper />
          </Suspense>

          <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            <Suspense fallback={<ChatWorkspaceSkeleton />}>
              <WorkspaceWrapper params={params} />
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </section>
  )
}

async function SidebarWrapper() {
  const responses = await listChats()
  if (responses.error) return null

  return <ChatHistorySidebar savedChats={responses.data ?? []} />
}

async function WorkspaceWrapper({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params

  const [initialChat, treeStructure] = await Promise.all([
    loadChat(chatId),
    generateTreeStructure(),
  ])

  if (!initialChat.data || initialChat.error) {
    notFound()
  }

  return (
    <ChatWorkspace
      key={chatId}
      totalFiles={treeStructure.totalFiles}
      treeNodes={treeStructure.treeNodes}
      initialChat={initialChat.data}
    />
  )
}
