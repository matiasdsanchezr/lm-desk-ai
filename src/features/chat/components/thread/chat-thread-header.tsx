"use client"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"

interface ChatThreadHeaderProps {
  messageCount: number
  isCopied: boolean
  onExportMarkdown: () => void
  onToggleExpandAll?: () => void
  allExpanded?: boolean
}

export function ChatThreadHeader({
  messageCount,
  isCopied,
  onExportMarkdown,
  onToggleExpandAll,
  allExpanded,
}: ChatThreadHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-md">
      {/* Información y estado */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <span className="icon-[lucide--messages-square] size-4" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-tight text-foreground sm:text-sm">
            Conversación
          </span>

          <Badge
            variant="secondary"
            className="h-5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
          >
            {messageCount} {messageCount === 1 ? "mensaje" : "mensajes"}
          </Badge>
        </div>

        <div className="hidden h-3.5 w-px bg-border/60 sm:block" />
      </div>

      {/* Barra de Acciones Globales */}
      <div className="flex items-center gap-1.5">
        {onToggleExpandAll && messageCount > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpandAll}
                  className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <span
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      allExpanded
                        ? "icon-[lucide--chevrons-down-up]"
                        : "icon-[lucide--chevrons-up-down]"
                    )}
                  />
                  <span className="hidden sm:inline">
                    {allExpanded ? "Colapsar" : "Expandir"}
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

        {messageCount > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onExportMarkdown}
                  className={cn(
                    "h-7 gap-1.5 rounded-lg border-border/70 px-2.5 text-xs font-medium transition-all",
                    isCopied &&
                      "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  <span
                    className={cn(
                      "size-3.5",
                      isCopied
                        ? "icon-[lucide--check] text-emerald-500"
                        : "icon-[lucide--file-text] text-muted-foreground"
                    )}
                  />
                  <span>{isCopied ? "¡Copiado!" : "Exportar Markdown"}</span>
                </Button>
              }
            />
            <TooltipContent side="bottom">
              <p className="text-xs">
                Copiar la conversación completa al portapapeles
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  )
}
