"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFileExplorerStore } from "@/features/file-explorer"
import { useShallow } from "zustand/shallow"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  disabled,
}: ImageUploadDialogProps) {
  const { imageUrls, setImageUrls } = useFileExplorerStore(
    useShallow((s) => ({
      imageUrls: s.imageUrls,
      setImageUrls: s.setImageUrls,
    }))
  )

  const imageUrlCount = imageUrls
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b border-border/40 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <span className="icon-[fa7-solid--images] text-primary" />
            Cargar Imágenes (URLs)
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Pega las URLs de las imágenes que deseas adjuntar como contexto
            visual para el modelo (una por línea).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Label
            htmlFor="imageUrls-dialog"
            className="text-xs font-medium text-muted-foreground"
          >
            URLs de las imágenes
          </Label>
          <Textarea
            id="imageUrls-dialog"
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder={`https://ejemplo.com/captura1.png\nhttps://ejemplo.com/captura2.png`}
            className="min-h-36 font-mono text-xs"
            disabled={disabled}
          />
          <p className="text-[11px] text-muted-foreground">
            Estas imágenes se descargarán y enviarán como adjuntos visuales al
            modelo.
          </p>
        </div>

        <DialogFooter className="border-t border-border/40 pt-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {imageUrlCount} URL(s) ingresada(s)
            </span>
            <Button onClick={() => onOpenChange(false)} size="sm">
              Guardar y cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
