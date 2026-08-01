"use client"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { useCopyToClipboard } from "@/features/chat/hooks/use-copy-to-clipboard"
import {
  extractTextByPartType,
  type ChatTurn,
} from "@/features/chat/utils/group-messages-into-turns"
import { createCodePlugin } from "@streamdown/code"
import type { UIDataTypes, UIMessage, UITools } from "ai"
import { memo, useState } from "react"
import { Streamdown } from "streamdown"

export function ChatTurnSkeleton() {
  return (
    <div className="space-y-4 px-1 py-2">
      <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
    </div>
  )
}

interface ChatTurnItemProps {
  turn: ChatTurn
  isStreaming: boolean
  isLast: boolean
  messages: UIMessage<unknown, UIDataTypes, UITools>[]
  setMessages?: (messages: UIMessage<unknown, UIDataTypes, UITools>[]) => void
}

const codePlugin = createCodePlugin({
  themes: ["github-light", "github-dark"],
})

export const ChatTurnItem = memo(
  function ChatTurnItem({
    turn,
    isStreaming,
    isLast,
    messages,
    setMessages,
  }: ChatTurnItemProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [isEditingUser, setIsEditingUser] = useState(false)
    const [userEditText, setUserEditText] = useState("")
    const [isEditingAssistant, setIsEditingAssistant] = useState(false)
    const [assistantEditText, setAssistantEditText] = useState("")
    const [isUserTextExpanded, setIsUserTextExpanded] = useState(false)

    const { isCopied, copy } = useCopyToClipboard()

    const rawUserText = extractTextByPartType(turn.userMessage, "text")
    const isFollowUp = rawUserText.includes("[Pregunta de seguimiento]:")
    const displayUserText = isFollowUp
      ? rawUserText.split("[Pregunta de seguimiento]:")[1].trim()
      : rawUserText

    const isLongText =
      displayUserText.length > 150 || displayUserText.split("\n").length > 2

    const reasoningText = extractTextByPartType(
      turn.assistantMessage,
      "reasoning"
    )
    const responseText = extractTextByPartType(turn.assistantMessage, "text")

    const updateMessagePart = (messageId: string, newText: string) => {
      if (!setMessages) return
      const updated = messages.map((msg) => {
        if (msg.id !== messageId) return msg
        const newParts = msg.parts?.map((p) =>
          p.type === "text" ? { ...p, text: newText } : p
        ) ?? [{ type: "text" as const, text: newText }]
        return { ...msg, parts: newParts }
      })
      setMessages(updated)
    }

    const handleEditUserClick = () => {
      setIsEditingUser(true)
      setUserEditText(displayUserText)
    }

    const handleSaveUser = () => {
      if (!turn.userMessage) return
      const finalText = isFollowUp
        ? `[Pregunta de seguimiento]:\n${userEditText}`
        : userEditText
      updateMessagePart(turn.userMessage.id, finalText)
      setIsEditingUser(false)
    }

    const handleSaveAssistant = () => {
      if (!turn.assistantMessage) return
      updateMessagePart(turn.assistantMessage.id, assistantEditText)
      setIsEditingAssistant(false)
    }

    const handleDeleteTurn = () => {
      if (!setMessages) return
      const idsToRemove = [
        turn.userMessage?.id,
        turn.assistantMessage?.id,
      ].filter(Boolean)
      setMessages(messages.filter((msg) => !idsToRemove.includes(msg.id)))
    }

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group border-b border-border/40 bg-muted/5 last:border-0"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/20 focus-visible:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <span
                className={
                  turn.userMessage
                    ? "icon-[lucide--user] text-xs"
                    : "icon-[fluent--brain-sparkle-20-regular] text-xs"
                }
              />
            </div>
            <span className="truncate text-sm font-medium text-foreground">
              {displayUserText || "Análisis Principal"}
            </span>
          </div>
          <span className="icon-[lucide--chevron-down] h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="relative overflow-hidden bg-background data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="flex flex-col gap-6 px-2 py-4 md:px-4">
            {turn.userMessage && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="icon-[lucide--user] h-3 w-3" />
                    Tu Consulta
                  </span>
                  {!isStreaming && setMessages && !isEditingUser && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleEditUserClick}
                        title="Editar consulta"
                      >
                        <span className="icon-[lucide--edit-2] h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={handleDeleteTurn}
                        title="Eliminar turno completo"
                      >
                        <span className="icon-[lucide--trash-2] h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditingUser ? (
                  <div className="flex animate-in flex-col gap-2 fade-in zoom-in-95">
                    <Textarea
                      value={userEditText}
                      onChange={(e) => setUserEditText(e.target.value)}
                      className="min-h-24 bg-background font-mono text-xs md:text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingUser(false)}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveUser}>
                        Guardar cambios
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-1.5">
                    <div
                      className={`whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 ${
                        !isUserTextExpanded ? "line-clamp-2" : ""
                      }`}
                    >
                      {displayUserText}
                    </div>
                    {isLongText && (
                      <button
                        type="button"
                        onClick={() => setIsUserTextExpanded((prev) => !prev)}
                        className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {isUserTextExpanded ? "Ver menos" : "Ver más"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="icon-[fluent--brain-sparkle-20-regular] h-3.5 w-3.5" />
                  Respuesta Generada
                </span>
                <div className="flex items-center gap-1">
                  {!isStreaming &&
                    turn.assistantMessage &&
                    setMessages &&
                    !isEditingAssistant && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingAssistant(true)
                          setAssistantEditText(responseText)
                        }}
                        className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <span className="icon-[lucide--edit-2] h-3.5 w-3.5" />
                        Editar
                      </Button>
                    )}
                  {turn.assistantMessage &&
                    !isStreaming &&
                    !isEditingAssistant && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copy(responseText)}
                        className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {isCopied ? (
                          <>
                            <span className="icon-[fa7-solid--check] text-green-500" />
                            <span className="text-green-500">Copiado</span>
                          </>
                        ) : (
                          <>
                            <span className="icon-[fa7-solid--copy]" />
                            Copiar
                          </>
                        )}
                      </Button>
                    )}
                </div>
              </div>

              {isEditingAssistant ? (
                <div className="flex animate-in flex-col gap-2 fade-in zoom-in-95">
                  <Textarea
                    value={assistantEditText}
                    onChange={(e) => setAssistantEditText(e.target.value)}
                    className="min-h-64 resize-y bg-background font-mono text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingAssistant(false)}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveAssistant}>
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              ) : turn.assistantMessage ? (
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
                  <Streamdown plugins={{ code: codePlugin }}>
                    {responseText}
                  </Streamdown>
                </div>
              ) : isStreaming && isLast ? (
                <ChatTurnSkeleton />
              ) : null}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.isLast !== nextProps.isLast) return false
    if (prevProps.isStreaming !== nextProps.isStreaming && nextProps.isLast)
      return false

    const prevUserText = extractTextByPartType(
      prevProps.turn.userMessage,
      "text"
    )
    const nextUserText = extractTextByPartType(
      nextProps.turn.userMessage,
      "text"
    )
    const prevAsstText = extractTextByPartType(
      prevProps.turn.assistantMessage,
      "text"
    )
    const nextAsstText = extractTextByPartType(
      nextProps.turn.assistantMessage,
      "text"
    )
    const prevReasoning = extractTextByPartType(
      prevProps.turn.assistantMessage,
      "reasoning"
    )
    const nextReasoning = extractTextByPartType(
      nextProps.turn.assistantMessage,
      "reasoning"
    )

    return (
      prevUserText === nextUserText &&
      prevAsstText === nextAsstText &&
      prevReasoning === nextReasoning
    )
  }
)
