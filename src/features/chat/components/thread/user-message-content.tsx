"use client"

import { Badge } from "@/shared/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import type { FileContent } from "@/shared/services/file-service"
import type { ImageFile } from "@/shared/types/image-file"
import { toDataUri } from "@/shared/utils/image-utils"
import type { UIMessage } from "ai"
import { memo, useState } from "react"
import { ChatImageThumbnail } from "../chat-image-thumbnail"

interface UserMessageContentProps {
  text: string
  message: UIMessage
}

export const UserMessageContent = memo(function UserMessageContent({
  text,
  message,
}: UserMessageContentProps) {
  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const fileParts = message.parts?.filter((p) => p.type === "file") ?? []

  const contextFilesPart = message.parts?.find(
    (p) => p.type === "data-contextFiles"
  ) as { type: string; data: FileContent[] } | undefined
  const contextFiles = contextFilesPart?.data ?? []

  return (
    <div className="flex flex-col gap-3">
      {/* Imágenes adjuntas */}
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

      {/* Snapshot de archivos de contexto adjuntos en este turno */}
      {contextFiles.length > 0 && (
        <Collapsible
          open={isFilesOpen}
          onOpenChange={setIsFilesOpen}
          className="rounded-lg border border-border/50 bg-background/60 p-2.5 text-xs transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <CollapsibleTrigger className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground">
              <span
                className={`icon-[lucide--chevron-down] size-3.5 transition-transform duration-200 ${
                  isFilesOpen ? "rotate-180" : ""
                }`}
              />
              <span className="icon-[lucide--folder-code] size-3.5 text-primary" />
              <span>
                Contexto adjunto ({contextFiles.length}{" "}
                {contextFiles.length === 1 ? "archivo" : "archivos"})
              </span>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="pt-2">
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pt-1">
              {contextFiles.map((file) => (
                <Badge
                  key={file.path}
                  variant="outline"
                  className="gap-1 bg-background/90 font-mono text-[10px] text-foreground/90"
                  title={file.path}
                >
                  <span className="icon-[lucide--file-text] size-3 text-muted-foreground" />
                  <span>{file.path.split("/").pop() ?? file.path}</span>
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Texto de la consulta */}
      {text && (
        <p className="wrap-break-word font-sans text-xs leading-relaxed whitespace-pre-wrap text-foreground/90 sm:text-sm">
          {text}
        </p>
      )}
    </div>
  )
})
