"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import React, { useCallback, useState } from "react"
import { useShallow } from "zustand/shallow"

interface PreviewModalState {
  isOpen: boolean
  selectedIndex: number | null
}

export function ChatPastedImages({ disabled }: { disabled?: boolean }) {
  const { imageFiles, removeImageFile, clearImageFiles } = useFileExplorerStore(
    useShallow((s) => ({
      imageFiles: s.imageFiles,
      removeImageFile: s.removeImageFile,
      clearImageFiles: s.clearImageFiles,
    }))
  )

  const [previewModal, setPreviewModal] = useState<PreviewModalState>({
    isOpen: false,
    selectedIndex: null,
  })

  const handleRemoveImage = useCallback(
    (indexToRemove: number, e?: React.MouseEvent) => {
      e?.stopPropagation()
      removeImageFile(indexToRemove)
      if (previewModal.selectedIndex === indexToRemove) {
        setPreviewModal({ isOpen: false, selectedIndex: null })
      }
    },
    [removeImageFile, previewModal.selectedIndex]
  )

  const handleClearAll = useCallback(() => {
    clearImageFiles()
    setPreviewModal({ isOpen: false, selectedIndex: null })
  }, [clearImageFiles])

  const handleOpenPreview = useCallback((index: number) => {
    setPreviewModal({
      isOpen: true,
      selectedIndex: index,
    })
  }, [])

  if (imageFiles.length === 0) return null

  const activeImage =
    previewModal.selectedIndex !== null
      ? imageFiles[previewModal.selectedIndex]
      : null

  return (
    <>
      <div className="flex flex-col gap-1.5 border-b border-border/40 bg-muted/20 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="icon-[lucide--images] size-3.5 text-primary" />
            <span>
              {imageFiles.length}{" "}
              {imageFiles.length === 1 ? "imagen adjunta" : "imágenes adjuntas"}
            </span>
          </span>

          {!disabled && imageFiles.length > 1 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              Quitar todas
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {imageFiles.map((img, index) => {
            const imageSrc = img.base64.startsWith("data:")
              ? img.base64
              : `data:${img.mimeType || "image/png"};base64,${img.base64}`

            const formatLabel =
              img.mimeType?.split("/")[1]?.toUpperCase() || "IMG"

            return (
              <div
                key={`${img.mimeType}-${index}`}
                onClick={() => handleOpenPreview(index)}
                className="group relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-background shadow-2xs transition-all hover:border-primary/50 hover:shadow-md sm:size-18"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={`Captura ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                  <span className="icon-[lucide--maximize-2] size-4 text-white drop-shadow-xs" />
                </div>

                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.2 font-mono text-[9px] font-medium text-white/90 backdrop-blur-xs">
                  {formatLabel}
                </span>

                {!disabled && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={(e) => handleRemoveImage(index, e)}
                          className="absolute -top-1.5 -right-1.5 size-5 rounded-full p-0 shadow-md transition-transform hover:scale-110 active:scale-95"
                        >
                          <span className="icon-[lucide--x] size-3" />
                        </Button>
                      }
                    />
                    <TooltipContent side="top">
                      <p className="text-[11px]">Eliminar imagen</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Dialog
        open={previewModal.isOpen}
        onOpenChange={(open) =>
          setPreviewModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="border-b border-border/40 px-4 py-3">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="icon-[lucide--image] size-4 text-primary" />
                <span>
                  Imagen{" "}
                  {previewModal.selectedIndex !== null
                    ? previewModal.selectedIndex + 1
                    : 1}{" "}
                  de {imageFiles.length}
                </span>
              </DialogTitle>

              {previewModal.selectedIndex !== null && !disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleRemoveImage(previewModal.selectedIndex as number)
                  }
                  className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <span className="icon-[lucide--trash-2] size-3.5" />
                  <span>Eliminar imagen</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {activeImage && (
            <div className="flex max-h-[75dvh] items-center justify-center overflow-auto bg-zinc-950/60 p-4 backdrop-blur-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  activeImage.base64.startsWith("data:")
                    ? activeImage.base64
                    : `data:${activeImage.mimeType || "image/png"};base64,${activeImage.base64}`
                }
                alt="Previsualización de captura"
                className="max-h-[70dvh] w-auto max-w-full rounded-md object-contain shadow-2xl ring-1 ring-white/10"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
