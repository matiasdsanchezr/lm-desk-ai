import { SidebarProvider } from "@/components/ui/sidebar"
import { listChats } from "@/features/chat-history/actions/chat-history-actions"
import { ChatHistorySidebar } from "@/features/chat-history/components/chat-history-sidebar"
import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { FileTreeNode } from "@/features/file-explorer/types/file-tree-node"

interface NewChatPageProps {
  totalFiles?: number
  treeNodes?: FileTreeNode[]
}

export const dynamic = "force-dynamic"

export default async function NewChatPage({}: NewChatPageProps) {
  const [treeStructure, responses] = await Promise.all([
    generateTreeStructure(),
    listChats(),
  ])

  return (
    <>
      <section className="min-h-0 w-full flex-1">
        <SidebarProvider className="h-full items-stretch">
          <div className="flex h-full w-full items-stretch overflow-hidden">
            <ChatHistorySidebar savedChats={responses.data ?? []} />
            <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
              <ChatWorkspace
                key="new-chat"
                totalFiles={treeStructure.totalFiles}
                treeNodes={treeStructure.treeNodes}
                initialChat={null}
              />
            </div>
          </div>
        </SidebarProvider>
      </section>
    </>
  )
}
