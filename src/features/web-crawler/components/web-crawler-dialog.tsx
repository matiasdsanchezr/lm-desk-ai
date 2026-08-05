"use client"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useShallow } from "zustand/shallow"
import { useWebCrawlerStore } from "../store/web-crawler-store"
import { WebCrawlerPanel } from "./web-crawler-panel"

interface WebCrawlerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
  onStartCrawl?: () => void
}

export function WebCrawlerDialog({
  open,
  onOpenChange,
  disabled,
  onStartCrawl,
}: WebCrawlerDialogProps) {
  const { selectedUrls } = useWebCrawlerStore(
    useShallow((s) => ({
      selectedUrls: s.selectedUrls,
    }))
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-6xl">
        <DialogHeader className="border-b border-border/40 px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <span className="icon-[fa7-solid--globe] text-primary" />
            Extracción e Ingesta Web
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Rastrea e ingresa páginas web formateadas como documentos para su
            análisis por el modelo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-6">
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/40 p-1">
            <WebCrawlerPanel disabled={disabled} onStartCrawl={onStartCrawl} />
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 bg-muted/20 px-4 py-3 sm:px-6">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {selectedUrls.length} página(s) seleccionada(s)
            </span>
            <Button onClick={() => onOpenChange(false)} size="sm">
              Confirmar selección
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
