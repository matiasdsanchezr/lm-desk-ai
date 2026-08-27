"use client"

import { toDataUri } from "@/shared/utils/image-utils"
import { useCallback } from "react"
import { useChatStore } from "../../store/chat-store"
import { ChatImageThumbnail } from "../chat-image-thumbnail"

export function ChatPastedImages({ disabled }: { disabled?: boolean }) {
  const attachedImages = useChatStore((s) => s.attachedImages)
  const removeAttachedImage = useChatStore((s) => s.removeAttachedImage)
  const clearAttachedImages = useChatStore((s) => s.clearAttachedImages)

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      removeAttachedImage(indexToRemove)
    },
    [removeAttachedImage]
  )

  const handleClearAll = useCallback(() => {
    clearAttachedImages()
  }, [clearAttachedImages])

  if (attachedImages.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 border-b border-border/40 bg-muted/20 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span className="icon-[lucide--images] size-3.5 text-primary" />
          <span>
            {attachedImages.length}{" "}
            {attachedImages.length === 1
              ? "imagen adjunta"
              : "imágenes adjuntas"}
          </span>
        </span>

        {!disabled && attachedImages.length > 1 && (
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
        {attachedImages.map((img, index) => {
          const imageSrc = toDataUri(img)
          const formatLabel =
            img.mimeType?.split("/")[1]?.toUpperCase() || "IMG"

          return (
            <ChatImageThumbnail
              key={`${img.mimeType}-${index}`}
              originalSrc={imageSrc}
              alt={`Captura ${index + 1}`}
              formatLabel={formatLabel}
              onRemove={() => handleRemoveImage(index)}
              disabled={disabled}
            />
          )
        })}
      </div>
    </div>
  )
}
