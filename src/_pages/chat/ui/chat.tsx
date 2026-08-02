import { getChatById } from "@/entities/chat"
import { getTreeStructure } from "@/features/file-explorer"
import { ChatWorkspace, ChatWorkspaceSkeleton } from "@/widgets/chat-workspace"
import { Suspense } from "react"

interface ChatProps {
  params: Promise<{ chatId?: string }>
}

export async function Chat({ params }: ChatProps) {
  const { chatId } = await params

  const initialChatPromise = chatId ? getChatById(chatId) : undefined
  const treeStructurePromise = getTreeStructure()

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
