"use client"

import { Button } from "@/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { Separator } from "@/shared/components/ui/separator"
import { cn } from "@/shared/lib/utils"
import type { UIMessage } from "ai"
import { memo, useState } from "react"
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard"
import { getMessagePart } from "../../utils"
import { InlineMessageEditor } from "./inline-message-editor"

interface UserTurnMessageProps {
  message?: UIMessage
  isStreaming: boolean
  onEditMessage?: (messageId: string, newText: string) => void
}

export const UserTurnMessage = memo(function UserTurnMessage({
  message,
  isStreaming,
  onEditMessage,
}: UserTurnMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { isCopied, copy } = useCopyToClipboard()

  if (!message) return null

  const userText = getMessagePart(message, "text")
  const isVisible = isExpanded || isEditing

  const handleSave = (newText: string) => {
    if (!onEditMessage) return
    onEditMessage(message.id, newText)
    setIsEditing(false)
  }

  return (
    <Collapsible
      open={isVisible}
      onOpenChange={setIsExpanded}
      className="rounded-xl border border-border/50 bg-muted/15 transition-all duration-200 hover:border-border/80"
    >
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-left text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none">
          <span
            className={cn(
              "icon-[lucide--chevron-down] size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              isVisible && "rotate-180"
            )}
          />
          <span className="icon-[lucide--user] size-3.5 text-primary" />
          <span>
            {isVisible
              ? "Ocultar consulta del usuario"
              : "Ver consulta del usuario"}
          </span>
        </CollapsibleTrigger>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                copy(userText)
              }}
              title="Copiar entrada"
            >
              <span
                className={cn(
                  "size-3.5",
                  isCopied
                    ? "icon-[lucide--check] text-emerald-500"
                    : "icon-[lucide--copy]"
                )}
              />
            </Button>
          )}

          {!isStreaming && onEditMessage && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(true)
                setIsEditing(true)
              }}
              title="Editar consulta"
            >
              <span className="icon-[lucide--edit-2] size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="px-3.5 pt-1 pb-3.5">
          <Separator className="mb-3 opacity-60" />
          {isEditing ? (
            <InlineMessageEditor
              className="max-h-[70dvh]"
              initialValue={userText}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p className="wrap-break-word max-h-[70dvh] overflow-auto font-sans text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {userText}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
})
