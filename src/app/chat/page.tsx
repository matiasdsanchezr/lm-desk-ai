import {
  ChatCompletionProvider,
  ChatWorkspace,
  ChatWorkspaceSkeleton,
} from "@/features/chat"
import { getFileTreeAction } from "@/features/file-explorer/actions/get-file-tree"
import { FileExplorerProvider } from "@/features/file-explorer/context/file-explorer-context"
import { cacheLife } from "next/cache"
import { Suspense } from "react"

export default function NewChatPage() {
  "use cache"
  cacheLife("max")
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
