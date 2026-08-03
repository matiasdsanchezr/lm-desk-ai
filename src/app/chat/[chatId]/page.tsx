import { loadChat } from "@/features/chat/actions/chat-history-actions"
import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { Suspense } from "react"

interface ExistingChatPageProps {
  params: Promise<{ chatId: string }>
}

export default async function ExistingChatPage({
  params,
}: ExistingChatPageProps) {
  const { chatId } = await params

  const initialChatPromise = loadChat(chatId)
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
