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

interface ChatThreadHeaderProps {
  title: string
  tokenCount: number
  messageCount: number
  onToggleExpandAll?: () => void
  allExpanded?: boolean
}

export function ChatThreadHeader({
  title,
  tokenCount,
  messageCount,
  onToggleExpandAll,
  allExpanded,
}: ChatThreadHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-12 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-3 backdrop-blur-md sm:px-4">
      {/* Lado izquierdo: Menú lateral, Título de la sesión y Contador de Tokens */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SidebarTrigger className="size-8 text-muted-foreground transition-colors hover:text-foreground" />

        <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
          <h1
            className="truncate text-xs font-semibold text-foreground sm:text-sm"
            title={title}
          >
            {title}
          </h1>

          {tokenCount > 0 && (
            <span className="shrink-0 text-[11px] text-muted-foreground/80 sm:text-xs">
              ~{tokenCount} tokens
            </span>
          )}
        </div>
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
