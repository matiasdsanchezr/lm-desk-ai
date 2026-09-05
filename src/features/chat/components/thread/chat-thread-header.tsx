"use client"

import { InferenceDrawerTrigger } from "@/features/inference/components/inference-drawer-trigger"
import { Button } from "@/shared/components/ui/button"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import { useCallback, useState, useTransition } from "react"

interface HeaderTitleEditorProps {
  initialTitle: string
  onSave: (newTitle: string) => Promise<void> | void
  onCancel: () => void
}

function HeaderTitleEditor({
  initialTitle,
  onSave,
  onCancel,
}: HeaderTitleEditorProps) {
  const [titleInput, setTitleInput] = useState(initialTitle)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = titleInput.trim()
    if (!trimmed || trimmed === initialTitle) {
      onCancel()
      return
    }

    startTransition(async () => {
      await onSave(trimmed)
      onCancel()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-sm flex-1 items-center gap-1"
    >
      <input
        type="text"
        value={titleInput}
        onChange={(e) => setTitleInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault()
            onCancel()
          }
        }}
        disabled={isPending}
        autoFocus
        className="h-7 w-full rounded-md border border-primary/40 bg-background px-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 sm:text-sm"
        placeholder="Título de la sesión..."
      />
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={isPending || !titleInput.trim()}
          className="size-7 rounded-md text-emerald-500 hover:bg-emerald-500/15"
          title="Guardar título"
        >
          <span
            className={cn(
              "size-3.5",
              isPending
                ? "icon-[lucide--loader-2] animate-spin"
                : "icon-[lucide--check]"
            )}
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={onCancel}
          className="size-7 rounded-md text-muted-foreground hover:bg-muted"
          title="Cancelar"
        >
          <span className="icon-[lucide--x] size-3.5" />
        </Button>
      </div>
    </form>
  )
}

interface ChatThreadHeaderProps {
  title?: string
  tokenCount: number
  messageCount: number
  allExpanded?: boolean
  onToggleExpandAll?: () => void
  onUpdateTitle?: (newTitle: string) => Promise<void> | void
}

export function ChatThreadHeader({
  title,
  tokenCount,
  messageCount,
  allExpanded,
  onToggleExpandAll,
  onUpdateTitle,
}: ChatThreadHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const shownTitle = title || "Nueva sesión"

  return (
    <header className="sticky top-0 z-10 flex h-12 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-3 backdrop-blur-md sm:px-4">
      {/* Lado izquierdo: Menú lateral, Título de la sesión (o input editable) y Contador de Tokens */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <SidebarTrigger className="size-8 text-muted-foreground transition-colors hover:text-foreground" />

        {isEditing && onUpdateTitle ? (
          <HeaderTitleEditor
            initialTitle={shownTitle}
            onSave={onUpdateTitle}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="group/header-title flex min-w-0 items-center gap-1.5 sm:gap-2">
            <h1
              className="truncate text-xs font-semibold text-foreground sm:text-sm"
              title={shownTitle}
            >
              {shownTitle}
            </h1>

            {title && onUpdateTitle && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleStartEdit}
                      className="size-6 rounded-md text-muted-foreground opacity-60 transition-opacity hover:opacity-100 group-hover/header-title:opacity-100"
                      title="Editar título"
                    >
                      <span className="icon-[lucide--edit-3] size-3" />
                      <span className="sr-only">
                        Editar título de la sesión
                      </span>
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  <p className="text-xs">Editar título</p>
                </TooltipContent>
              </Tooltip>
            )}

            {tokenCount > 0 && (
              <span className="shrink-0 text-[11px] text-muted-foreground/80 sm:text-xs">
                ~{tokenCount} tokens
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lado derecho: Acciones (Expandir/Colapsar y Configuración de Inferencia) */}
      <div className="flex shrink-0 items-center gap-1">
        {onToggleExpandAll && messageCount > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleExpandAll}
                  className="size-8 rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span
                    className={cn(
                      "size-4 transition-transform duration-200",
                      allExpanded
                        ? "icon-[lucide--chevrons-down-up]"
                        : "icon-[lucide--chevrons-up-down]"
                    )}
                  />
                  <span className="sr-only">
                    {allExpanded ? "Colapsar mensajes" : "Expandir mensajes"}
                  </span>
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p className="text-xs">
                {allExpanded
                  ? "Colapsar todos los mensajes"
                  : "Expandir todos los mensajes"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        <InferenceDrawerTrigger />
      </div>
    </header>
  )
}
