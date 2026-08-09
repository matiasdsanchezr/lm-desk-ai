import {
  ChatCompletionProvider,
  ChatWorkspace,
  getChatById,
} from "@/features/chat"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"
import { getFileTree } from "@/features/file-explorer/queries"
import { Suspense } from "react"

interface ChatPageProps {
  params: Promise<{ chatId?: string[] }>
}

async function getInitialChat(params: Promise<{ chatId?: string[] }>) {
  const { chatId } = await params
  const id = chatId?.[0]
  return id ? getChatById(id) : null
}

export default function ChatPage({ params }: ChatPageProps) {
  const treeStructurePromise = getFileTree()
  const initialChatPromise = getInitialChat(params)

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
