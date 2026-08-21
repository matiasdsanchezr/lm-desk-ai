"use client"

import { FileExplorerTrigger } from "@/features/file-explorer"
import { WebCrawlerTrigger } from "@/features/web-crawler/components/web-crawler-trigger"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"

interface ChatComposerToolbarProps {
  isStreaming: boolean
  isProcessingContext: boolean
  includeContext: boolean
  includeReasoning: boolean
  hasMessages: boolean
  hasTask: boolean
  totalImagesCount: number
  estimatedTokens: number
  onOpenImageDialog: () => void
  onClearTask: () => void
  onToggleContext: (val: boolean) => void
  onToggleReasoning: (val: boolean) => void
  onBuildPromptOnly: () => void
  onSend: () => void
  onStop: () => void
}

export function ChatComposerToolbar({
  isStreaming,
  isProcessingContext,
  includeContext,
  includeReasoning,
  hasMessages,
  hasTask,
  totalImagesCount,
  estimatedTokens,
  onOpenImageDialog,
  onClearTask,
  onToggleContext,
  onToggleReasoning,
  onBuildPromptOnly,
  onSend,
  onStop,
}: ChatComposerToolbarProps) {
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 border-t border-border/40 px-2.5 py-1.5 sm:px-3">
      {/* Controles del Contexto */}
      <div className="flex flex-wrap items-center gap-1">
        <FileExplorerTrigger disabled={isStreaming} />
        <WebCrawlerTrigger disabled={isStreaming} />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                onClick={onOpenImageDialog}
                variant="ghost"
                disabled={isStreaming}
                className={cn(
                  "h-7 rounded-lg text-xs transition-colors",
                  totalImagesCount > 0
                    ? "gap-1.5 bg-primary/10 px-2 text-primary hover:bg-primary/20 hover:text-primary"
                    : "size-7 p-0 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="icon-[lucide--image] size-3.5 shrink-0" />
                {totalImagesCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-primary">
                    {totalImagesCount}
                  </span>
                )}
              </Button>
            }
          />
          <TooltipContent side="top">
            <p className="text-xs">
              Adjuntar imágenes{" "}
              {totalImagesCount > 0 && `(${totalImagesCount} cargadas)`}
            </p>
          </TooltipContent>
        </Tooltip>

        {hasTask && !isStreaming && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClearTask}
                  className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <span className="icon-[lucide--trash-2] size-3.5" />
                </Button>
              }
            />
            <TooltipContent side="top">
              <p className="text-xs">Limpiar mensaje</p>
            </TooltipContent>
          </Tooltip>
        )}

        <div className="mx-1 h-3.5 w-px bg-border/60" />

        <div className="flex items-center gap-1">
          <Checkbox
            id="include-context"
            checked={includeContext}
            onCheckedChange={(val) => onToggleContext(Boolean(val))}
            disabled={isStreaming}
            className="size-3.5 rounded-sm"
          />
          <Label
            htmlFor="include-context"
            className={cn(
              "cursor-pointer select-none text-[11px] transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            Incluir inserciones
          </Label>
        </div>

        {hasMessages && (
          <div className="flex items-center gap-1 pl-1">
            <Checkbox
              id="include-reasoning"
              checked={includeReasoning}
              onCheckedChange={(val) => onToggleReasoning(Boolean(val))}
              disabled={isStreaming}
              className="size-3.5 rounded-sm"
            />
            <Label
              htmlFor="include-reasoning"
              className="cursor-pointer select-none text-[11px] text-muted-foreground hover:text-foreground"
            >
              Razonamiento previo
            </Label>
          </div>
        )}
      </div>

      {/* Acciones principales */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "hidden text-[10px] text-muted-foreground sm:inline",
            estimatedTokens > 16000 && "font-semibold text-amber-500"
          )}
          title="Estimación de tokens"
        >
          ~{estimatedTokens.toLocaleString()} tokens
        </span>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onBuildPromptOnly}
                disabled={!hasTask || isProcessingContext || isStreaming}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              >
                {isProcessingContext ? (
                  <span className="icon-[lucide--loader-2] size-3.5 animate-spin" />
                ) : (
                  <span className="icon-[lucide--file-code-2] size-3.5" />
                )}
              </Button>
            }
          />
          <TooltipContent side="top">
            <p className="text-xs">Compilar Prompt para exportar</p>
          </TooltipContent>
        </Tooltip>

        {isStreaming ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onStop}
            className="h-7 gap-1 rounded-lg px-2.5 text-xs font-medium"
          >
            <span className="icon-[lucide--square] size-3 fill-current" />
            <span>Detener</span>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={onSend}
            disabled={!hasTask || isProcessingContext}
            className="h-7 gap-1.5 rounded-lg px-3 text-xs font-medium shadow-xs transition-transform active:scale-95"
          >
            {isProcessingContext ? (
              <>
                <span className="icon-[lucide--loader-2] size-3.5 animate-spin" />
                <span className="hidden sm:inline">Procesando</span>
              </>
            ) : (
              <>
                <span>Enviar</span>
                <span className="icon-[lucide--send] size-3" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
