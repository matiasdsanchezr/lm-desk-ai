// src/app/chat/[[...chatId]]/page.tsx
import {
  ChatCompletionProvider,
  ChatWorkspace,
  getChatById,
} from "@/features/chat"
import { getFileTreeAction } from "@/features/file-explorer/actions/get-file-tree"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
export const instant = false

interface ChatPageProps {
  params: Promise<{ chatId?: string[] }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params
  const id = chatId?.[0]

  const treeStructurePromise = getFileTreeAction()
  const initialChatPromise = id ? getChatById(id) : Promise.resolve(null)

  return (
    <FileExplorerProvider fileTreePromise={treeStructurePromise}>
      <ChatCompletionProvider initialChatPromise={initialChatPromise}>
        <ChatWorkspace />
      </ChatCompletionProvider>
    </FileExplorerProvider>
  )
}
