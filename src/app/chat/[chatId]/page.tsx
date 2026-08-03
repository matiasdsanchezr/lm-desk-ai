import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { getChatById } from "@/features/chat/services/history-service"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"
import { Suspense } from "react"

interface ChatPageProps {
  params: Promise<{ chatId: string }>
}

export default async function ChatIdPage({ params }: ChatPageProps) {
  const { chatId } = await params

  const treeStructurePromise = generateTreeStructure()
  const initialChatPromise = getChatById(chatId)

  return (
    <Suspense fallback={<ChatWorkspaceSkeleton />}>
      <FileExplorerProvider treeStructurePromise={treeStructurePromise}>
        <ChatWorkspace initialChatPromise={initialChatPromise} />
      </FileExplorerProvider>
    </Suspense>
  )
}
