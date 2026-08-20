"use client"

import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { useState, useTransition } from "react"
import { fetchRemoteImagesAction } from "../../actions/fetch-remote-images"
import { useChatActions, useChatStore } from "../../store/chat-store"

interface ImageUrlsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

export function ImageUrlsDialog({
  open,
  onOpenChange,
  disabled,
}: ImageUrlsDialogProps) {
  const [urlInput, setUrlInput] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const attachedImagesCount = useChatStore((s) => s.attachedImages.length)
  const { addAttachedImages } = useChatActions()

  const urlsToProcess = urlInput
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)

  const handleImport = () => {
    if (urlsToProcess.length === 0) {
      onOpenChange(false)
      return
    }

    setErrorMessage(null)

    startTransition(async () => {
      const response = await fetchRemoteImagesAction(urlsToProcess)

      if (
        response.error &&
        (!response.data || response.data.images.length === 0)
      ) {
        setErrorMessage(response.error)
        return
      }

      if (response.data?.images && response.data.images.length > 0) {
        addAttachedImages(response.data.images)
      }

      if (response.data?.failedUrls && response.data.failedUrls.length > 0) {
        setErrorMessage(
          `No se pudieron cargar ${response.data.failedUrls.length} imagen(es). Revisa las URLs e inténtalo nuevamente.`
        )
        setUrlInput(response.data.failedUrls.join("\n"))
      } else {
        setUrlInput("")
        onOpenChange(false)
      }
    })
  }

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b border-border/40 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <span className="icon-[lucide--image-plus] text-primary" />
            Adjuntar URLs de imágenes
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Pega los enlaces directos de las imágenes que deseas adjuntar (una
            por línea). Se descargarán y agregarán a tu sesión de análisis.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {errorMessage && (
            <Alert variant="destructive" className="py-2 text-xs">
              <span className="icon-[lucide--alert-triangle] size-3.5" />
              <AlertDescription className="text-xs">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <Label
            htmlFor="imageUrls-dialog"
            className="text-xs font-medium text-muted-foreground"
          >
            URLs de las imágenes
          </Label>
          <Textarea
            id="imageUrls-dialog"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={`https://ejemplo.com/captura1.png\nhttps://ejemplo.com/captura2.png`}
            className="min-h-32 font-mono text-xs"
            disabled={disabled || isPending}
          />
          <p className="text-[11px] text-muted-foreground">
            Las imágenes son procesadas por el servidor y enviadas de forma
            segura en formato multimodal.
          </p>
        </div>

        <DialogFooter className="border-t border-border/40 pt-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {urlsToProcess.length} URL(s) detectada(s) · {attachedImagesCount}{" "}
              adjunta(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                size="sm"
                disabled={disabled || isPending || urlsToProcess.length === 0}
                className="gap-1.5"
              >
                {isPending ? (
                  <>
                    <span className="icon-[lucide--loader-2] size-3.5 animate-spin" />
                    <span>Cargando...</span>
                  </>
                ) : (
                  <>
                    <span className="icon-[lucide--download] size-3.5" />
                    <span>Importar imágenes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
