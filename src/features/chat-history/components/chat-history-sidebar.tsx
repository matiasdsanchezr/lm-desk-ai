"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar"
import { useChatActions } from "@/features/chat/store/chat-store"
import { cn } from "@/lib/utils"
import { ActionState } from "@/types/action-state"
import { useParams, useRouter } from "next/navigation"
import { use, useCallback } from "react"
import type { SavedChatMeta } from "../types/saved-chat"
import { ChatHistoryItem } from "./chat-history-item"

interface ChatHistorySidebarProps {
  chatsPromise: Promise<ActionState<SavedChatMeta[]>>
}

export function ChatHistorySidebar({ chatsPromise }: ChatHistorySidebarProps) {
  const responses = use(chatsPromise)
  const savedChats = responses.data ?? []

  const { clearPrompts } = useChatActions()
  const router = useRouter()
  const params = useParams()
  const currentId = params?.chatId as string | undefined

  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  const handleSelect = useCallback(
    (id: string) => {
      if (isMobile) {
        setOpenMobile(false)
      }
      router.push(`/chat/${id}`)
    },
    [router, isMobile, setOpenMobile]
  )

  const handleNewChat = useCallback(() => {
    clearPrompts()
    if (isMobile) {
      setOpenMobile(false)
    }

    if (!currentId) {
      router.refresh()
      return
    }

    router.push("/chat")
  }, [router, currentId, clearPrompts, isMobile, setOpenMobile])

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
              title="Nuevo análisis"
              className="inline-flex size-8 items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:scale-95 group-data-[collapsible=icon]:size-8 md:h-8 md:w-auto md:px-2.5 md:text-xs md:font-medium"
            >
              <span className="icon-[lucide--plus] size-4 shrink-0" />
              <span className="hidden group-data-[collapsible=icon]:hidden md:inline">
                Nuevo
              </span>
            </button>

            {!isMobile && (
              <button
                type="button"
                onClick={toggleSidebar}
                title={
                  isCollapsed ? "Expandir historial" : "Colapsar historial"
                }
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span
                  className={cn(
                    isCollapsed
                      ? "icon-[lucide--panel-left-open]"
                      : "icon-[lucide--panel-left-close]",
                    "size-4"
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 group-data-[collapsible=icon]:hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            {savedChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                <span className="mb-2 icon-[lucide--archive-x] size-8 opacity-40" />
                <span>No hay análisis guardados</span>
              </div>
            ) : (
              <SidebarMenu className="gap-1.5">
                {savedChats.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentId === chat.id}
                    isMobile={isMobile}
                    currentId={currentId}
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
