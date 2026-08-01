import { generateTreeStructure } from "@/entities/file/api/get-file-tree"
import { loadChat } from "@/features/chat/api/chat-history-actions"
import { ChatWorkspaceSkeleton } from "@/features/chat/ui/chat-workspace-skeleton"
import { ChatWorkspace } from "@/widgets/chat-workspace/ui/chat-workspace"
import { Suspense } from "react"

interface ChatProps {
  params: Promise<{ chatId?: string }>
}

export async function Chat({ params }: ChatProps) {
  const { chatId } = await params

  const initialChatPromise = chatId ? loadChat(chatId) : undefined
  const treeStructurePromise = generateTreeStructure()

  return (
    <Suspense fallback={<ChatWorkspaceSkeleton />}>
      <ChatWorkspace
        key={chatId}
        treeStructurePromise={treeStructurePromise}
        initialChatPromise={initialChatPromise}
      />
    </Suspense>
  )
}
