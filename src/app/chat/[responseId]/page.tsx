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
  params: Promise<{ responseId: string }>
}

export default async function ExistingChatPage({
  params,
}: ExistingChatPageProps) {
  const { responseId } = await params

  const [initialResponse, treeStructure, responses] = await Promise.all([
    loadChat(responseId),
    generateTreeStructure(),
    listChats(),
  ])

  if (!initialResponse.data || initialResponse.error) {
    notFound()
  }

  return (
    <section className="min-h-0 w-full flex-1">
      <SidebarProvider className="h-full items-stretch">
        <div className="flex h-full w-full items-stretch overflow-hidden">
          <ChatHistorySidebar responses={responses.data ?? []} />
          <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            <ChatWorkspace
              key={responseId}
              totalFiles={treeStructure.totalFiles}
              treeNodes={treeStructure.treeNodes}
              initialResponse={initialResponse.data}
            />
          </div>
        </div>
      </SidebarProvider>
    </section>
  )
}
