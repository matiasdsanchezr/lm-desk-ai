import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { generateTreeStructure } from "@/features/file-explorer/actions/get-file-tree"
import { Suspense } from "react"

export default function NewChatPage() {
  const treeStructurePromise = generateTreeStructure()

  return (
    <Suspense fallback={<ChatWorkspaceSkeleton />}>
      <ChatWorkspace treeStructurePromise={treeStructurePromise} />
    </Suspense>
  )
}
