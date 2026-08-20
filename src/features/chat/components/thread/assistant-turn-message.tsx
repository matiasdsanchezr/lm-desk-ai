"use client"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/shared/components/ai-elements/reasoning"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { createCodePlugin } from "@streamdown/code"
import type { UIMessage } from "ai"
import { memo, useState } from "react"
import { Streamdown } from "streamdown"
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard"
import { getMessagePart } from "../../utils"
import { InlineMessageEditor } from "./inline-message-editor"

const codePlugin = createCodePlugin({
  themes: ["github-light", "github-dark"],
})

interface AssistantTurnMessageProps {
  message?: UIMessage
  isStreaming: boolean
  isLast: boolean
  onEditMessage?: (messageId: string, newText: string) => void
  onDeleteTurn?: () => void
}

export const AssistantTurnMessage = memo(function AssistantTurnMessage({
  message,
  isStreaming,
  isLast,
  onEditMessage,
  onDeleteTurn,
}: AssistantTurnMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { isCopied, copy } = useCopyToClipboard()

  if (!message) return null

  const responseText = getMessagePart(message, "text")
  const reasoningText = getMessagePart(message, "reasoning")

  const handleSave = (newText: string) => {
    if (!onEditMessage) return
    onEditMessage(message.id, newText)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {isEditing ? (
        <InlineMessageEditor
          initialValue={responseText}
          className="min-h-64"
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none px-1 pb-2 overflow-anchor-none">
          {reasoningText && (
            <Reasoning
              className="mb-4 w-full"
              isStreaming={isStreaming && isLast}
            >
              <ReasoningTrigger />
              <ReasoningContent>{reasoningText}</ReasoningContent>
            </Reasoning>
          )}
          <Streamdown plugins={{ code: codePlugin }}>{responseText}</Streamdown>
        </div>
      )}

      {/* Barra de Acciones del Asistente */}
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          <span className="icon-[fluent--brain-sparkle-20-regular] size-3.5" />
          Contenido generado por IA
        </span>

        <div className="flex items-center gap-1">
          {!isStreaming && !isEditing && (
            <>
              {onDeleteTurn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeleteTurn}
                  className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-destructive"
                  title="Eliminar esta interacción"
                >
                  <span className="icon-[lucide--trash-2] size-3.5" />
                  Eliminar
                </Button>
              )}

              {onEditMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <span className="icon-[lucide--edit-2] size-3.5" />
                  Editar
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(responseText)}
                className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <span
                  className={cn(
                    "size-3.5",
                    isCopied
                      ? "icon-[lucide--check] text-emerald-500"
                      : "icon-[lucide--copy]"
                  )}
                />
                {isCopied ? "Copiado" : "Copiar"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
