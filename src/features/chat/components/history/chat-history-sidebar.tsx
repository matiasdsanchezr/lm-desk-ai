"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar"
import { useParams, useRouter } from "next/navigation"
import { startTransition, use, useCallback } from "react"
import { useChatActions } from "../../store/chat-store"
import type { ChatMeta } from "../../types"
import { ChatHistoryItem } from "./chat-history-item"

interface ChatHistorySidebarProps {
  savedChatsPromise: Promise<ChatMeta[]>
}

export function ChatHistorySidebar({
  savedChatsPromise,
}: ChatHistorySidebarProps) {
  const savedChats = use(savedChatsPromise)
  const { clearPrompts } = useChatActions()
  const router = useRouter()
  const params = useParams()
  const chatId = params?.chatId as string | undefined

  const handleSelect = useCallback(
    (id: string) => {
      startTransition(() => {
        router.push(`/chat/${id}`)
      })
    },
    [router]
  )

  const handleNewChat = useCallback(() => {
    clearPrompts()
    router.push("/chat")
  }, [router, clearPrompts])

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/40 bg-sidebar/50 backdrop-blur-xs transition-all duration-300"
    >
      <SidebarHeader className="border-b border-border/40 p-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:border-b-0 md:px-3.5 md:py-3">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            <span className="icon-[lucide--history] size-4 shrink-0 text-primary" />
            <span>Historial</span>
          </div>

          <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              title="Nueva Sesión"
              className="inline-flex size-8 items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:scale-95 group-data-[collapsible=icon]:size-8 md:h-8 md:w-auto md:px-2.5 md:text-xs md:font-medium"
            >
              <span className="icon-[lucide--plus] size-4 shrink-0" />
              <span className="hidden group-data-[collapsible=icon]:hidden md:inline">
                Nuevo
              </span>
            </button>

            <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            {savedChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                <span className="mb-2 icon-[lucide--archive-x] size-8 opacity-40" />
                <span>No hay sesiones guardadas</span>
              </div>
            ) : (
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
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
