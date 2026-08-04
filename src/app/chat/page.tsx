import { ChatWorkspace } from "@/features/chat/components/chat-workspace"
import { ChatWorkspaceSkeleton } from "@/features/chat/components/chat-workspace-skeleton"
import { ChatCompletionProvider } from "@/features/chat/providers/chat-completion-provider"
import { getFileTreeAction } from "@/features/file-explorer/actions/get-file-tree"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"
import { Suspense } from "react"

export default function NewChatPage() {
  const treeStructurePromise = getFileTreeAction()

  return (
    <Suspense fallback={<ChatWorkspaceSkeleton />}>
      <FileExplorerProvider fileTreePromise={treeStructurePromise}>
        <ChatCompletionProvider>
          <ChatWorkspace />
        </ChatCompletionProvider>
      </FileExplorerProvider>
    </Suspense>
  )
}
