import { SidebarProvider } from "@/components/ui/sidebar"
import { listChats } from "@/features/chat-history/actions/chat-history-actions"
import { ChatHistorySidebar } from "@/features/chat-history/components/chat-history-sidebar"
import { ChatHistorySidebarSkeleton } from "@/features/chat-history/components/chat-history-sidebar-skeleton"
import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { Suspense } from "react"

export default function NewChatPage() {
  const treeStructurePromise = generateTreeStructure()
  const chatsPromise = listChats()

  return (
    <section className="min-h-0 w-full flex-1">
      <SidebarProvider defaultOpen={false} className="h-full items-stretch">
        <div className="flex h-full w-full items-stretch overflow-hidden">
          <Suspense fallback={<ChatHistorySidebarSkeleton />}>
            <ChatHistorySidebar chatsPromise={chatsPromise} />
          </Suspense>
          <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            <Suspense fallback={<ChatWorkspaceSkeleton />}>
              <ChatWorkspace treeStructurePromise={treeStructurePromise} />
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </section>
  )
}
