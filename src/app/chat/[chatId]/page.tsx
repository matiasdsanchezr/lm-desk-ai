import {
  ChatCompletionProvider,
  ChatWorkspace,
  getChatById,
} from "@/features/chat"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"
import { getFileTree } from "@/features/file-explorer/queries"

interface ChatPageProps {
  params: Promise<{ chatId: string }>
}

export default async function ExistingChatPage({ params }: ChatPageProps) {
  const { chatId } = await params

  const chatPromise = chatId ? getChatById(chatId) : undefined
  const fileTreePromise = getFileTree()

  return (
    <FileExplorerProvider fileTreePromise={fileTreePromise}>
      <ChatCompletionProvider chatId={chatId} chatPromise={chatPromise}>
        <ChatWorkspace />
      </ChatCompletionProvider>
    </FileExplorerProvider>
  )
}
