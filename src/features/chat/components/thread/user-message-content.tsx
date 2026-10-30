"use client"

import { Badge } from "@/shared/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import type { ImageFile } from "@/shared/types/image-file"
import { toDataUri } from "@/shared/utils/image-utils"
import { memo, useState } from "react"
import type { MyUIMessage } from "../../types"
import { getContextSources } from "../../utils/chat-utils"
import { ChatImageThumbnail } from "../chat-image-thumbnail"

interface UserMessageContentProps {
  text: string
  message: MyUIMessage
}

export const UserMessageContent = memo(function UserMessageContent({
  text,
  message,
}: UserMessageContentProps) {
  const [isContextOpen, setIsContextOpen] = useState(false)
  const fileParts = message.parts?.filter((p) => p.type === "file") ?? []
  const sources = getContextSources(message)

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

      {/* Snapshot unificado de fuentes adjuntas en este turno */}
      {sources.length > 0 && (
        <Collapsible
          open={isContextOpen}
          onOpenChange={setIsContextOpen}
          className="rounded-lg border border-border/50 bg-background/60 p-2.5 text-xs transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <CollapsibleTrigger className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground">
              <span
                className={`icon-[lucide--chevron-down] size-3.5 transition-transform duration-200 ${
                  isContextOpen ? "rotate-180" : ""
                }`}
              />
              <span className="icon-[lucide--layers] size-3.5 text-primary" />
              <span>
                Contexto adjunto ({sources.length}{" "}
                {sources.length === 1 ? "fuente" : "fuentes"})
              </span>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="pt-2">
            <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pt-1">
              {sources.map((source) => {
                if (source.type === "file") {
                  const fileName = source.path.split("/").pop() ?? source.path
                  return (
                    <Badge
                      key={source.path}
                      variant="outline"
                      className="gap-1 bg-background/90 font-mono text-[10px] text-foreground/90"
                      title={source.path}
                    >
                      <span className="icon-[lucide--file-code-2] size-3 text-primary" />
                      <span>{fileName}</span>
                      {source.dependencies &&
                        source.dependencies.length > 0 && (
                          <span
                            className="text-[9px] text-muted-foreground"
                            title={`${source.dependencies.length} dependencias`}
                          >
                            (+{source.dependencies.length})
                          </span>
                        )}
                    </Badge>
                  )
                }

                if (source.type === "web") {
                  return (
                    <Badge
                      key={source.url}
                      variant="outline"
                      className="gap-1 border-blue-500/30 bg-blue-500/5 font-mono text-[10px] text-blue-500 hover:bg-blue-500/10"
                      title={source.url}
                    >
                      <span className="icon-[lucide--globe] size-3 shrink-0" />
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="max-w-48 truncate hover:underline"
                      >
                        {source.title || source.url}
                      </a>
                    </Badge>
                  )
                }

                return null
              })}
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
