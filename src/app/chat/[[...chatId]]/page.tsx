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
  // Extraemos el ID si viene en la URL (ej: /chat/session-123 -> "session-123")
  const id = chatId?.[0]

  const treeStructurePromise = getFileTreeAction()
  // Si es una ruta nueva (/chat), enviamos null. Si no, obtenemos el chat.
  const initialChatPromise = id ? getChatById(id) : Promise.resolve(null)

  return (
    <FileExplorerProvider fileTreePromise={treeStructurePromise}>
      {/* 
        Pasamos el chatId y la promesa al Provider. 
        Al estar en una Catch-All Route, este componente NO se desmontará al cambiar entre /chat y /chat/[id],
        evitando así que se reinicie el flujo de streaming.
      */}
      <ChatCompletionProvider
        chatId={id}
        initialChatPromise={initialChatPromise}
      >
        <ChatWorkspace />
      </ChatCompletionProvider>
    </FileExplorerProvider>
  )
}
