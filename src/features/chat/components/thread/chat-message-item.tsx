"use client"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard"
import { cn } from "@/shared/lib/utils"
import type { UIMessage } from "ai"
import { memo, useCallback, useEffect, useState } from "react"
import { getMessagePart } from "../../utils/utils"
import { AssistantMessageContent } from "./assistant-message-content"
import { InlineMessageEditor } from "./inline-message-editor"
import { UserMessageContent } from "./user-message-content"

interface ChatMessageItemProps {
  message: UIMessage
  isStreaming: boolean
  isLast: boolean
  forcedExpandState?: boolean | null
  onEditMessage?: (messageId: string, newText: string) => void
  onDeleteMessage?: (messageId: string) => void
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isStreaming,
  isLast,
  forcedExpandState,
  onEditMessage,
  onDeleteMessage,
}: ChatMessageItemProps) {
  const isUser = message.role === "user"

  const [internalOpen, setInternalOpen] = useState<boolean>(!isUser)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const { isCopied, copy } = useCopyToClipboard()

  useEffect(() => {
    if (forcedExpandState !== null && forcedExpandState !== undefined) {
      setInternalOpen(forcedExpandState)
    }
  }, [forcedExpandState])

  const isOpen = isEditing || internalOpen

  const textContent = getMessagePart(message, "text")
  const reasoningContent = !isUser ? getMessagePart(message, "reasoning") : ""
  const attachedFilesCount =
    message.parts?.filter((p) => p.type === "file").length ?? 0

  const handleSaveEdit = useCallback(
    (newText: string) => {
      if (!onEditMessage) return
      onEditMessage(message.id, newText)
      setIsEditing(false)
    },
    [message.id, onEditMessage]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDeleteMessage?.(message.id)
    },
    [message.id, onDeleteMessage]
  )

  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalOpen(true)
    setIsEditing(true)
  }, [])

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      copy(textContent)
    },
    [copy, textContent]
  )

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setInternalOpen}
      className={cn(
        "group relative rounded-xl border transition-all duration-200",
        isUser
          ? "border-border/60 bg-muted/20 hover:border-border/90"
          : "border-border/40 bg-card/70 shadow-2xs hover:border-border/70"
      )}
    >
      {/* Cabecera / Trigger de colapso y barra de herramientas */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <CollapsibleTrigger
          disabled={isEditing}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left select-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        >
          <span
            className={cn(
              "icon-[lucide--chevron-down] size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />

          <div className="flex shrink-0 items-center gap-1.5">
            {isUser ? (
              <div className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                <span className="icon-[lucide--user] size-3" />
              </div>
            ) : (
              <div className="flex size-5 items-center justify-center rounded-md bg-emerald-500/10">
                <span className="icon-[lucide--sparkles] size-3" />
              </div>
            )}
            <span className="text-xs font-semibold text-foreground">
              {isUser ? "Usuario" : "Asistente"}
            </span>
          </div>

          {/* Badges de soporte (adjuntos) */}
          {attachedFilesCount > 0 && (
            <Badge
              variant="outline"
              className="h-4 gap-1 px-1.5 font-mono text-[9px] text-muted-foreground"
            >
              <span className="icon-[lucide--image] size-2.5" />
              {attachedFilesCount}
            </Badge>
          )}

          {/* Vista previa compacta si está colapsado */}
          {!isOpen && !isEditing && (
            <span className="truncate font-mono text-xs text-muted-foreground">
              — {textContent || "Mensaje sin texto"}
            </span>
          )}
        </CollapsibleTrigger>

        {/* Acciones de Mensaje */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-90 transition-opacity group-hover:opacity-100">
          {!isEditing && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                title="Copiar contenido"
              >
                <span
                  className={cn(
                    "size-3",
                    isCopied
                      ? "icon-[lucide--check] text-emerald-500"
                      : "icon-[lucide--copy]"
                  )}
                />
              </Button>

              {!isStreaming && onEditMessage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                  onClick={handleStartEdit}
                  title="Editar mensaje"
                >
                  <span className="icon-[lucide--edit-3] size-3" />
                </Button>
              )}

              {!isStreaming && onDeleteMessage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                  title="Eliminar mensaje"
                >
                  <span className="icon-[lucide--trash-2] size-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contenido expandible */}
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="border-t border-border/30 px-3 pt-3 pb-3 sm:px-4 sm:pb-4">
          {isEditing ? (
            <InlineMessageEditor
              initialValue={textContent}
              className={isUser ? "min-h-24" : "min-h-56"}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : isUser ? (
            <UserMessageContent text={textContent} message={message} />
          ) : (
            <AssistantMessageContent
              text={textContent}
              reasoning={reasoningContent}
              isStreaming={isStreaming}
              isLast={isLast}
              message={message}
            />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
})
