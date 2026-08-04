"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
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

export const GeneratedPrompt = () => {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const standalonePrompt = useChatStore((s) => s.standalonePrompt)
  const fileContents = useFileExplorerStore((s) => s.fileContents)

  const validFiles = useMemo(
    () => fileContents.filter((f) => !f.error && f.content),
    [fileContents]
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(standalonePrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-xl border border-border/60 bg-muted/30 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none">
          <span
            className={cn(
              "icon-[lucide--chevron-down] h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
          <span className="icon-[lucide--file-code-2] h-4 w-4 shrink-0 text-primary" />
          <span className="hidden sm:inline">Prompt generado</span>
          <span className="sm:hidden">Prompt</span>
          <Badge variant="secondary" className="h-5 text-[10px] font-semibold">
            {validFiles.length}{" "}
            {validFiles.length === 1 ? "archivo" : "archivos"}
          </Badge>
        </CollapsibleTrigger>

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
              Copiar todo
            </>
          )}
        </Button>
      </div>

      <CollapsibleContent className="flex flex-col gap-3 px-4 pb-4">
        {/* Badges de archivos incluidos */}
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto rounded-md border bg-background/50 p-2">
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

        <Textarea
          readOnly
          value={standalonePrompt}
          className="max-h-125 min-h-64 resize-y bg-background font-mono text-xs focus-visible:ring-1"
          aria-label="Código fuente unificado"
        />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Haga clic dentro y use Ctrl+A para seleccionar manualmente
          </span>
          <span>
            {standalonePrompt.length.toLocaleString()} caracteres · ~
            {Math.ceil(standalonePrompt.length / 4).toLocaleString()} tokens
          </span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
