"use client"

import { ImageFile } from "@/shared/types/image-file"
import { toDataUri } from "@/shared/utils/image-utils"
import type { UIMessage } from "ai"
import { memo } from "react"
import { ChatImageThumbnail } from "../chat-image-thumbnail"

interface UserMessageContentProps {
  text: string
  message: UIMessage
}

export const UserMessageContent = memo(function UserMessageContent({
  text,
  message,
}: UserMessageContentProps) {
  const fileParts = message.parts?.filter((p) => p.type === "file") ?? []

  return (
    <div className="flex flex-col gap-3">
      {fileParts.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {fileParts.map((part, index) => {
            const isImage = part.mediaType?.startsWith("image/")
            if (!isImage) return null

            const imageFile: ImageFile = {
              mimeType: part.mediaType,
              base64: part.url,
            }

            const imageSrc = toDataUri(imageFile)
            const formatLabel = part.mediaType?.split("/")[1]?.toUpperCase()

            return (
              <ChatImageThumbnail
                key={`${part.url}-${index}`}
                originalSrc={imageSrc}
                alt={`Adjunto ${index + 1}`}
                formatLabel={formatLabel}
                className="size-16 sm:size-20"
              />
            )
          })}
        </div>
      )}

      {text && (
        <p className="wrap-break-word font-sans text-xs leading-relaxed whitespace-pre-wrap text-foreground/90 sm:text-sm">
          {text}
        </p>
      )}
    </div>
  )
})
