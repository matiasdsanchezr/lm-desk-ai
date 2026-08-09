"use client"

import { SidebarMenu } from "@/shared/components/ui/sidebar"
import { useParams, useRouter } from "next/navigation"
import { startTransition, use, useCallback } from "react"
import type { ChatMeta } from "../../types"
import { ChatHistoryItem } from "./chat-history-item"

interface ChatHistoryListProps {
  savedChatsPromise: Promise<ChatMeta[]>
}

export function ChatHistoryList({ savedChatsPromise }: ChatHistoryListProps) {
  const router = useRouter()
  const params = useParams()
  const chatId = params?.chatId as string | undefined
  const savedChats = use(savedChatsPromise)

  const handleSelect = useCallback(
    (id: string) => {
      startTransition(() => {
        router.push(`/chat/${id}`)
      })
    },
    [router]
  )

  if (savedChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
        <span className="mb-2 icon-[lucide--archive-x] size-8 opacity-40" />
        <span>No hay sesiones guardadas</span>
      </div>
    )
  }

  return (
    <SidebarMenu className="gap-1.5">
      {savedChats.map((chat) => (
        <ChatHistoryItem
          key={chat.id}
          chat={chat}
          isActive={chatId === chat.id}
          currentId={chatId}
          onSelect={handleSelect}
        />
      ))}
    </SidebarMenu>
  )
}
