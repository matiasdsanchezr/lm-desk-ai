"use client"

import { toDataUri } from "@/features/chat/utils"
import { ImageFile } from "@/shared/types/image-file"
import type { UIMessage } from "ai"
import { memo } from "react"

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

            return (
              <div
                key={`${part.url}-${index}`}
                className="group relative size-16 overflow-hidden rounded-lg border border-border/80 bg-background shadow-xs transition-transform hover:scale-105 sm:size-20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toDataUri(imageFile)}
                  alt={`Adjunto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 font-mono text-[8px] text-white">
                  {part.mediaType?.split("/")[1]?.toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <p className="wrap-break-word font-sans text-xs leading-relaxed whitespace-pre-wrap text-foreground/90 sm:text-sm">
        {text}
      </p>
    </div>
  )
})
