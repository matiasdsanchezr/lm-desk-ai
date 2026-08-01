import { ChatWorkspace } from "@/widgets/chat-workspace/ui/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/ui/chat-workspace-skeleton"
import { generateTreeStructure } from "@/entities/file/api/get-file-tree"
import { Suspense } from "react"

export default function NewChatPage() {
  const treeStructurePromise = generateTreeStructure()

  return (
    <Suspense fallback={<ChatWorkspaceSkeleton />}>
      <ChatWorkspace treeStructurePromise={treeStructurePromise} />
    </Suspense>
  )
}
