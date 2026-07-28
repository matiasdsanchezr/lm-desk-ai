// src/features/chat-history/components/chat-history-sidebar.tsx
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { MoreHorizontal } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { deleteChat } from "../actions/chat-history-actions"
import type { SavedChatMeta } from "../types/saved-chat"

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatChatDate(dateValue: Date | string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Fecha desconocida"
  return dateFormatter.format(date)
}

interface ChatHistorySidebarProps {
  savedChats: SavedChatMeta[]
}

interface ChatHistoryItemProps {
  chat: SavedChatMeta
  isActive: boolean
  isMobile: boolean
  currentId?: string
  onSelect: (id: string) => void
}

function ChatHistoryItem({
  chat,
  isActive,
  isMobile,
  currentId,
  onSelect,
}: ChatHistoryItemProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isConfirming, setIsConfirming] = useState(false)

  const formattedDate = formatChatDate(chat.createdAt || "0")

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteChat(chat.id)
      if (!res.error && currentId === chat.id) {
        router.push("/chat")
      }
    })
  }

  return (
    <SidebarMenuItem className="group/menu-item relative">
      <SidebarMenuButton
        isActive={isActive}
        className={cn(
          "h-auto w-full cursor-pointer rounded-lg border text-left transition-colors hover:bg-muted/50",
          isActive
            ? "border-primary/30 bg-muted"
            : "border-zinc-200/40 bg-background/50 dark:border-zinc-800/40"
        )}
        render={
          <button
            type="button"
            onClick={() => onSelect(chat.id)}
            className="flex w-full flex-col items-start gap-1 p-3 disabled:opacity-60"
          >
            <span className="line-clamp-2 w-full text-xs font-medium text-foreground">
              {chat.title || "Análisis sin título"}
            </span>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="icon-[lucide--calendar] size-3" />
              <time
                suppressHydrationWarning
                dateTime={new Date(chat.createdAt).toISOString()}
              >
                {formattedDate}
              </time>
            </div>
          </button>
        }
      />

      <DropdownMenu
        onOpenChange={(open) => {
          if (!open) setIsConfirming(false)
        }}
      >
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction showOnHover>
              <MoreHorizontal />
              <span className="sr-only">Menú de opciones</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent
          className="w-52"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem>
            <span className="icon-[lucide--edit] size-3.5" />
            <span>Editar título</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isPending}
            className={cn(
              "cursor-pointer transition-colors",
              isConfirming
                ? "bg-destructive/10 text-destructive focus:bg-destructive focus:text-destructive-foreground font-medium"
                : "text-destructive focus:bg-destructive/10 focus:text-destructive"
            )}
            closeOnClick={false}
            onClick={(e) => {
              if (!isConfirming) {
                e.preventDefault()
                setIsConfirming(true)
              } else {
                handleDelete()
              }
            }}
          >
            {isPending ? (
              <>
                <span className="icon-[lucide--loader-2] size-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : isConfirming ? (
              <>
                <span className="icon-[lucide--alert-triangle] size-3.5" />
                <span>¿Confirmar eliminación?</span>
              </>
            ) : (
              <>
                <span className="icon-[lucide--trash-2] size-3.5" />
                <span>Eliminar</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
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
