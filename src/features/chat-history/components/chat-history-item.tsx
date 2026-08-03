"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { cn } from "@/shared/lib/utils"
import { useRouter } from "next/navigation"
import { memo, useCallback, useState, useTransition } from "react"
import { deleteChat, updateChat } from "../actions/chat-history-actions"
import type { SavedChatMeta } from "../types/saved-chat"

interface ChatHistoryItemProps {
  chat: SavedChatMeta
  isActive: boolean
  currentId?: string
  onSelect: (id: string) => void
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatChatDate(dateValue: Date | string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Fecha desconocida"
  return dateFormatter.format(date)
}

export const ChatHistoryItem = memo(function ChatHistoryItem({
  chat,
  isActive,
  currentId,
  onSelect,
}: ChatHistoryItemProps) {
  const router = useRouter()
  
  const [isPending, startTransition] = useTransition()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [titleInput, setTitleInput] = useState(chat.title || "")

  const formattedDate = formatChatDate(chat.createdAt || "0")

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const res = await deleteChat(chat.id)
      if (!res.error && currentId === chat.id) {
        router.push("/chat")
      }
    })
  }, [chat.id, currentId, router])

  const handleSaveTitle = useCallback(() => {
    const trimmedTitle = titleInput.trim()
    if (!trimmedTitle || trimmedTitle === chat.title) {
      setIsEditing(false)
      setTitleInput(chat.title || "")
      return
    }

    startTransition(async () => {
      const res = await updateChat(chat.id, { title: trimmedTitle })
      if (!res.error) {
        setIsEditing(false)
      }
    })
  }, [chat.id, chat.title, titleInput])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setTitleInput(chat.title || "")
  }, [chat.title])

  if (isEditing) {
    return (
      <SidebarMenuItem className="px-2 py-1.5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveTitle()
          }}
          className="flex w-full items-center gap-1.5"
        >
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault()
                handleCancelEdit()
              }
            }}
            disabled={isPending}
            autoFocus
            className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            placeholder="Título del análisis..."
          />

          <button
            type="submit"
            disabled={isPending || !titleInput.trim()}
            title="Guardar título"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-emerald-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 disabled:opacity-50"
          >
            <span
              className={cn(
                isPending
                  ? "icon-[lucide--loader-2] animate-spin"
                  : "icon-[lucide--check]",
                "size-4"
              )}
            />
          </button>

          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={isPending}
            title="Cancelar"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <span className="icon-[lucide--x] size-4" />
          </button>
        </form>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem className="group/menu-item relative">
      <SidebarMenuButton
        isActive={isActive}
        className={cn(
          "h-auto w-full cursor-pointer rounded-md border text-left transition-colors hover:bg-muted/50",
          isActive
            ? "border-primary/30 bg-muted"
            : "border-border/40 bg-background/50"
        )}
        render={
          <button
            type="button"
            onClick={() => onSelect(chat.id)}
            className="flex w-full flex-col items-start gap-1 p-2.5 disabled:opacity-60"
          >
            <span className="line-clamp-2 w-full text-xs font-medium text-foreground">
              {chat.title || "Análisis sin título"}
            </span>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="icon-[lucide--calendar] size-3 shrink-0" />
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
          className="mr-1"
          render={
            <SidebarMenuAction showOnHover>
              <span className="icon-[lucide--more-horizontal] size-4" />
              <span className="sr-only">Menú de opciones</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent className="w-52">
          <DropdownMenuItem
            onClick={() => setIsEditing(true)}
            className="cursor-pointer"
          >
            <span className="icon-[lucide--edit] size-3.5" />
            <span>Editar título</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isPending}
            className={cn(
              "cursor-pointer transition-colors",
              isConfirming
                ? "bg-destructive/10 font-medium text-destructive focus:bg-destructive focus:text-destructive-foreground"
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
})
