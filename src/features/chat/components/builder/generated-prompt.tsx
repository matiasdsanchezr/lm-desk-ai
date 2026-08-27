"use client"

import { useFileExplorerStore } from "@/features/file-explorer"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { useMemo, useState } from "react"
import { useChatStore } from "../../store/chat-store"
import { estimateTokenCount } from "../../utils/utils"

export const GeneratedPrompt = () => {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  const exportablePrompt = useChatStore((s) => s.exportablePrompt)
  const fileContents = useFileExplorerStore((s) => s.fileContents)
  const resetGeneratedPrompts = useChatStore((s) => s.resetGeneratedPrompts)

  const validFiles = useMemo(
    () =>
      fileContents?.filter(
        (f) => !f.error && f.content !== undefined && f.content !== null
      ) ?? [],
    [fileContents]
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportablePrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  if (!exportablePrompt) return null

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-xl border border-primary/20 bg-primary/5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:opacity-80 focus-visible:outline-none">
          <span
            className={cn(
              "icon-[lucide--chevron-down] h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
          <span className="icon-[lucide--file-code-2] h-4 w-4 shrink-0 text-primary" />
          <span className="hidden font-semibold sm:inline">
            Prompt exportable generado
          </span>
          <span className="font-semibold sm:hidden">Prompt</span>
          <Badge variant="secondary" className="h-5 text-[10px] font-semibold">
            {validFiles.length}{" "}
            {validFiles.length === 1 ? "archivo" : "archivos"}
          </Badge>
        </CollapsibleTrigger>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            {copied ? (
              <>
                <span className="icon-[fa7-solid--check] h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Copiado</span>
              </>
            ) : (
              <>
                <span className="icon-[fa7-solid--copy] h-3.5 w-3.5 text-muted-foreground" />
                <span>Copiar prompt</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetGeneratedPrompts}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Cerrar panel"
          >
            <span className="icon-[lucide--x] size-4" />
          </Button>
        </div>
      </div>

      <CollapsibleContent className="flex flex-col gap-3 px-4 pb-4">
        {/* Badges de archivos incluidos */}
        {validFiles.length > 0 && (
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto rounded-md border bg-background/60 p-2">
            {validFiles.map((f) => (
              <Badge
                key={f.path}
                variant="outline"
                className="bg-background font-mono text-[10px]"
              >
                {f.path.split("/").pop()}
              </Badge>
            ))}
          </div>
        )}

        <Textarea
          readOnly
          value={exportablePrompt}
          className="max-h-125 min-h-64 resize-y bg-background font-mono text-xs focus-visible:ring-1"
          aria-label="Prompt generado completo"
        />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Listo para copiar y pegar en cualquier LLM.</span>
          <span>
            {exportablePrompt.length.toLocaleString()} caracteres · ~
            {estimateTokenCount(exportablePrompt)} tokens
          </span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
