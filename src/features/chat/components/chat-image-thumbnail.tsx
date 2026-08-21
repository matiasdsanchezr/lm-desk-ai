"use client"

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
import { cn } from "@/shared/lib/utils"
import { memo, useEffect, useState } from "react"
import { getOrCreateThumbnail } from "../../../shared/utils/image-utils"

interface ChatImageThumbnailProps {
  originalSrc: string
  alt?: string
  formatLabel?: string
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

export const ChatImageThumbnail = memo(function ChatImageThumbnail({
  originalSrc,
  alt = "Imagen adjunta",
  formatLabel,
  onRemove,
  disabled = false,
  className,
}: ChatImageThumbnailProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(true)

  useEffect(() => {
    let isMounted = true

    getOrCreateThumbnail(originalSrc)
      .then((thumb) => {
        if (isMounted) {
          setThumbnailSrc(thumb)
          setIsLoadingThumbnail(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setThumbnailSrc(originalSrc)
          setIsLoadingThumbnail(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [originalSrc])

  return (
    <>
      <div
        onClick={() => setIsPreviewOpen(true)}
        className={cn(
          "group relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-muted/30 shadow-2xs transition-all hover:border-primary/50 hover:shadow-md sm:size-18",
          className
        )}
      >
        {isLoadingThumbnail ? (
          <div className="flex h-full w-full items-center justify-center bg-muted/40">
            <span className="icon-[lucide--loader-2] size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnailSrc || originalSrc}
            alt={alt}
            decoding="async"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        )}

        {/* Overlay hover para ampliar */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
          <span className="icon-[lucide--maximize-2] size-4 text-white drop-shadow-xs" />
        </div>

        {/* Badge de formato */}
        {formatLabel && (
          <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.2 font-mono text-[9px] font-medium text-white/90 backdrop-blur-xs">
            {formatLabel}
          </span>
        )}

        {/* Botón para eliminar (si aplica) */}
        {!disabled && onRemove && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
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

      {/* Modal de visualización en Alta Resolución (Lazy loaded al abrir) */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="border-b border-border/40 px-4 py-3">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="icon-[lucide--image] size-4 text-primary" />
                <span>{alt}</span>
              </DialogTitle>
              {!disabled && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsPreviewOpen(false)
                    onRemove()
                  }}
                  className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <span className="icon-[lucide--trash-2] size-3.5" />
                  <span>Eliminar imagen</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {isPreviewOpen && (
            <div className="flex max-h-[75dvh] items-center justify-center overflow-auto bg-zinc-950/60 p-4 backdrop-blur-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalSrc}
                alt={alt}
                decoding="async"
                className="max-h-[70dvh] w-auto max-w-full rounded-md object-contain shadow-2xl ring-1 ring-white/10"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
})
