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
import { cn } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { useCallback } from "react"
import type { SavedChatMeta } from "../types/saved-chat"
import { ChatHistoryItem } from "./chat-history-item"

interface ChatHistorySidebarProps {
  savedChats: SavedChatMeta[]
}

export function ChatHistorySidebar({ savedChats }: ChatHistorySidebarProps) {
  const router = useRouter()
  const params = useParams()
  const currentId = params?.chatId as string | undefined

  const { state, isMobile, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleSelect = useCallback(
    (id: string) => {
      router.push(`/chat/${id}`)
    },
    [router]
  )

  const handleNewChat = useCallback(() => {
    router.push("/chat")
  }, [router])

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "h-full shrink-0 border-r border-zinc-200/50 bg-zinc-50/50 transition-all duration-300 dark:border-zinc-800/50 dark:bg-zinc-950/20",
        isCollapsed ? "w-12" : "w-full md:w-80"
      )}
    >
      <SidebarHeader
        className={cn(
          "border-b border-zinc-200/50 dark:border-zinc-800/50",
          isCollapsed ? "p-2" : "px-3 py-3"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-col justify-center" : "justify-between"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="icon-[lucide--history] size-4 text-primary" />
              <span>Historial</span>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-1.5",
              isCollapsed && "flex-col"
            )}
          >
            <button
              type="button"
              onClick={handleNewChat}
              title="Nuevo análisis"
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20",
                isCollapsed ? "size-8" : "px-2.5 py-1.5 text-xs font-medium"
              )}
            >
              <span className="icon-[lucide--plus] size-4" />
              {!isCollapsed && <span>Nuevo</span>}
            </button>

            <button
              type="button"
              onClick={toggleSidebar}
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
          </div>
        </div>
      </SidebarHeader>

      {!isCollapsed && (
        <SidebarContent className="p-2">
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
      )}
    </Sidebar>
  )
}
