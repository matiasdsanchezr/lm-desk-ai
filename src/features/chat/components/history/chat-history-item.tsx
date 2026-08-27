"use client"

import { DateDisplay } from "@/shared/components/date-display"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard"
import { cn } from "@/shared/lib/utils"
import { useRouter } from "next/navigation"
import { memo, useCallback, useState, useTransition } from "react"
import {
  deleteChat,
  duplicateChat,
  getChatMarkdown,
  updateChat,
} from "../../actions/chat-actions"
import type { ChatMeta } from "../../types"

interface ChatHistoryItemProps {
  chat: ChatMeta
  isActive: boolean
  currentId?: string
  onSelect: (id: string) => void
}

type ItemStatus =
  | "idle"
  | "editing"
  | "confirming-delete"
  | "duplicating"
  | "exporting"

export const ChatHistoryItem = memo(function ChatHistoryItem({
  chat,
  isActive,
  currentId,
  onSelect,
}: ChatHistoryItemProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<ItemStatus>("idle")
  const [titleInput, setTitleInput] = useState(chat.title || "")
  const { isCopied, copy } = useCopyToClipboard()

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      const res = await deleteChat(chat.id)
      if (!res.error && currentId === chat.id) {
        router.push("/chat")
      }
      setStatus("idle")
    })
  }, [chat.id, currentId, router])

  const handleSaveTitle = useCallback(() => {
    const trimmedTitle = titleInput.trim()
    if (!trimmedTitle || trimmedTitle === chat.title) {
      setStatus("idle")
      setTitleInput(chat.title || "")
      return
    }

    startTransition(async () => {
      await updateChat(chat.id, { title: trimmedTitle })
      setStatus("idle")
    })
  }, [chat.id, chat.title, titleInput])

  const handleCancelEdit = useCallback(() => {
    setStatus("idle")
    setTitleInput(chat.title || "")
  }, [chat.title])

  const handleDuplicate = useCallback(() => {
    setStatus("duplicating")
    startTransition(async () => {
      try {
        const res = await duplicateChat(chat.id)
        if (res.data?.id) router.push(`/chat/${res.data.id}`)
      } finally {
        setStatus("idle")
      }
    })
  }, [chat.id, router])

  const handleExportMarkdown = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      setStatus("exporting")
      try {
        const res = await getChatMarkdown(chat.id)
        if (res.data) await copy(res.data)
      } finally {
        setStatus("idle")
      }
    },
    [chat.id, copy]
  )

  if (status === "editing") {
    return (
      <SidebarMenuItem className="w-full min-w-0 px-1 py-0.5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveTitle()
          }}
          className="flex w-full min-w-0 items-center gap-1 rounded-md border border-primary/40 bg-background p-1 shadow-2xs focus-within:ring-1 focus-within:ring-primary"
        >
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && handleCancelEdit()}
            disabled={isPending}
            autoFocus
            className="h-7 min-w-0 flex-1 bg-transparent px-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            placeholder="Título de la sesión..."
          />
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="submit"
              disabled={isPending || !titleInput.trim()}
              title="Guardar"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-emerald-500 hover:bg-emerald-500/15 disabled:opacity-40"
            >
              <span
                className={cn(
                  "size-3.5",
                  isPending
                    ? "icon-[lucide--loader-2] animate-spin"
                    : "icon-[lucide--check]"
                )}
              />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isPending}
              title="Cancelar"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-muted-foreground hover:bg-muted"
            >
              <span className="icon-[lucide--x] size-3.5" />
            </button>
          </div>
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
            className="flex w-full flex-col items-start gap-1 p-2.5"
          >
            <span className="line-clamp-2 w-full text-xs font-medium text-foreground">
              {chat.title || "Sesión sin título"}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="icon-[lucide--calendar] size-3 shrink-0" />
              <DateDisplay dateValue={chat.createdAt} />
            </div>
          </button>
        }
      />

      <DropdownMenu onOpenChange={(open) => !open && setStatus("idle")}>
        <DropdownMenuTrigger
          className="mr-1"
          render={
            <SidebarMenuAction showOnHover>
              <span className="icon-[lucide--more-horizontal] size-4" />
              <span className="sr-only">Opciones</span>
            </SidebarMenuAction>
          }
        />
        <DropdownMenuContent className="w-52">
          <DropdownMenuItem
            onClick={() => setStatus("editing")}
            className="cursor-pointer"
          >
            <span className="icon-[lucide--edit] size-3.5" />
            <span>Editar título</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDuplicate}
            disabled={status === "duplicating" || isPending}
            className="cursor-pointer"
          >
            <span
              className={cn(
                "size-3.5",
                status === "duplicating"
                  ? "icon-[lucide--loader-2] animate-spin"
                  : "icon-[lucide--copy]"
              )}
            />
            <span>
              {status === "duplicating" ? "Duplicando..." : "Duplicar sesión"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleExportMarkdown}
            disabled={status === "exporting"}
            closeOnClick={false}
            className="cursor-pointer"
          >
            <span
              className={cn(
                "size-3.5",
                status === "exporting"
                  ? "icon-[lucide--loader-2] animate-spin"
                  : isCopied
                    ? "icon-[lucide--check] text-emerald-500"
                    : "icon-[lucide--file-text]"
              )}
            />
            <span>
              {status === "exporting"
                ? "Exportando..."
                : isCopied
                  ? "¡Copiado al portapapeles!"
                  : "Exportar Markdown"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isPending}
            className={cn(
              "cursor-pointer transition-colors",
              status === "confirming-delete"
                ? "bg-destructive/10 font-medium text-destructive focus:bg-destructive focus:text-destructive-foreground"
                : "text-destructive focus:bg-destructive/10 focus:text-destructive"
            )}
            closeOnClick={false}
            onClick={(e) => {
              if (status !== "confirming-delete") {
                e.preventDefault()
                setStatus("confirming-delete")
              } else {
                handleDelete()
              }
            }}
          >
            <span
              className={cn(
                "size-3.5",
                isPending
                  ? "icon-[lucide--loader-2] animate-spin"
                  : status === "confirming-delete"
                    ? "icon-[lucide--alert-triangle]"
                    : "icon-[lucide--trash-2]"
              )}
            />
            <span>
              {isPending
                ? "Eliminando..."
                : status === "confirming-delete"
                  ? "¿Confirmar eliminación?"
                  : "Eliminar Sesión"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
})
