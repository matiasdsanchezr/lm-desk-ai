import {
  ChatCompletionProvider,
  ChatWorkspace,
  ChatWorkspaceSkeleton,
  getChatById,
} from "@/features/chat"
import { getFileTreeAction } from "@/features/file-explorer/actions/get-file-tree"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"
import { Suspense } from "react"

interface ChatPageProps {
  params: Promise<{ chatId: string }>
}

export default async function ChatIdPage({ params }: ChatPageProps) {
  const { chatId } = await params

  const treeStructurePromise = getFileTreeAction()
  const initialChatPromise = getChatById(chatId)

  return (
    <Suspense fallback={<ChatWorkspaceSkeleton />}>
      <FileExplorerProvider fileTreePromise={treeStructurePromise}>
        <ChatCompletionProvider initialChatPromise={initialChatPromise}>
          <ChatWorkspace />
        </ChatCompletionProvider>
      </FileExplorerProvider>
    </Suspense>
  )
}
