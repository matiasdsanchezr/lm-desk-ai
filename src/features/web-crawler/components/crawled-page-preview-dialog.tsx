"use client"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Textarea } from "@/shared/components/ui/textarea"
import { useState } from "react"
import type { CrawledPageNode } from "../types"

interface CrawledPagePreviewDialogProps {
  page: CrawledPageNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrawledPagePreviewDialog({
  page,
  open,
  onOpenChange,
}: CrawledPagePreviewDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!page) return null

  const contentLength = page.content?.length ?? 0
  const estimatedTokens = Math.ceil(contentLength / 4)

  const handleCopy = async () => {
    if (!page.content) return
    try {
      await navigator.clipboard.writeText(page.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar el contenido:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-h-[85vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border/40 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="truncate text-base font-semibold sm:text-lg">
                {page.title || "Detalle de la Página"}
              </DialogTitle>
              <DialogDescription className="truncate font-mono text-xs text-muted-foreground">
                {page.url}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-background font-mono text-[10px]"
              >
                {page.domain}
              </Badge>
              <span className="text-muted-foreground">
                {contentLength.toLocaleString()} caracteres · ~
                {estimatedTokens.toLocaleString()} tokens
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!page.content}
              className="h-7 gap-1.5 text-xs font-medium"
            >
              {copied ? (
                <>
                  <span className="icon-[fa7-solid--check] h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500">Copiado</span>
                </>
              ) : (
                <>
                  <span className="icon-[fa7-solid--copy] h-3.5 w-3.5 text-muted-foreground" />
                  Copiar contenido
                </>
              )}
            </Button>
          </div>

          <div className="min-h-0 flex-1">
            {page.content ? (
              <Textarea
                readOnly
                value={page.content}
                className="h-full w-full resize-none bg-background font-mono text-xs leading-relaxed focus-visible:ring-1"
                aria-label="Contenido extraído de la página"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center text-muted-foreground">
                <span className="icon-[fa7-solid--file-circle-xmark] h-8 w-8 opacity-40" />
                <p className="text-sm font-medium">
                  No se encontró contenido de texto disponible para esta página.
                </p>
                {page.errorMessage && (
                  <p className="text-xs text-destructive">
                    {page.errorMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 bg-muted/20 px-4 py-3 sm:px-6">
          <Button type="button" onClick={() => onOpenChange(false)} size="sm">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
