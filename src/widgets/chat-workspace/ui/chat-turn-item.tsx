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
import { Separator } from "@/components/ui/separator"
import { getMessagePart } from "@/entities/chat/lib/chat-utils"
import { type ChatTurn } from "@/entities/chat/model/types"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/shared/lib/utils"
import { UIMessage } from "@ai-sdk/react"
import { createCodePlugin } from "@streamdown/code"
import { memo, useState } from "react"
import { Streamdown } from "streamdown"
import { InlineMessageEditor } from "./inline-message-editor"

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
  title: string
  turn: ChatTurn
  isStreaming: boolean
  isLast: boolean
  messages: UIMessage[]
  setMessages?: (messages: UIMessage[]) => void
}

const codePlugin = createCodePlugin({
  themes: ["github-light", "github-dark"],
})

export const ChatTurnItem = memo(
  function ChatTurnItem({
    title,
    turn,
    isStreaming,
    isLast,
    messages,
    setMessages,
  }: ChatTurnItemProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [isUserTextExpanded, setIsUserTextExpanded] = useState(false)
    const { isCopied, copy } = useCopyToClipboard()
    const [editingRole, setEditingRole] = useState<"user" | "assistant" | null>(
      null
    )

    const userText = getMessagePart(turn.userMessage, "text")
    const reasoningText = getMessagePart(turn.assistantMessage, "reasoning")
    const responseText = getMessagePart(turn.assistantMessage, "text")

    const handleSave = (role: "user" | "assistant", newText: string) => {
      if (!setMessages) return

      const messageToUpdate =
        role === "user" ? turn.userMessage : turn.assistantMessage
      if (!messageToUpdate) return

      const updatedMessages = messages.map((msg) => {
        if (msg.id !== messageToUpdate.id) return msg

        const newParts = msg.parts?.map((p) =>
          p.type === "text" ? { ...p, text: newText } : p
        ) ?? [{ type: "text" as const, text: newText }]

        return { ...msg, parts: newParts }
      })

      setMessages(updatedMessages)
      setEditingRole(null)
    }

    const handleDeleteTurn = () => {
      if (!setMessages) return
      const idsToRemove = [
        turn.userMessage?.id,
        turn.assistantMessage?.id,
      ].filter(Boolean)
      setMessages(messages.filter((msg) => !idsToRemove.includes(msg.id)))
    }

    const isUserContentVisible = isUserTextExpanded || editingRole === "user"

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group border-b border-border/40 bg-muted/5 last:border-0"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/20 focus-visible:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <span className={"icon-[lucide--message-square-text]"} />
            </div>
            <span className="truncate text-sm font-medium text-foreground">
              {title || "Consulta de Usuario"}
            </span>
          </div>
          <span className="icon-[lucide--chevron-down] h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent className="relative overflow-hidden bg-background data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="flex flex-col gap-6 px-2 py-4 md:px-4">
            {/* --- SECCIÓN DEL USUARIO --- */}
            {turn.userMessage && (
              <Collapsible
                open={isUserContentVisible}
                onOpenChange={setIsUserTextExpanded}
                className="rounded-xl border border-border/50 bg-muted/15 transition-all duration-200 hover:border-border/80"
              >
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-left text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <span
                      className={cn(
                        "icon-[lucide--chevron-down] h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isUserContentVisible && "rotate-180"
                      )}
                    />
                    <span className="icon-[lucide--user] h-3.5 w-3.5 text-primary" />
                    <span>
                      {isUserContentVisible
                        ? "Ocultar Entrada de Usuario"
                        : "Mostrar Entrada de Usuario"}
                    </span>
                  </CollapsibleTrigger>

                  {!isStreaming && setMessages && editingRole !== "user" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsUserTextExpanded(true)
                          setEditingRole("user")
                        }}
                        title="Editar consulta"
                      >
                        <span className="icon-[lucide--edit-2] h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTurn()
                        }}
                        title="Eliminar turno completo"
                      >
                        <span className="icon-[lucide--trash-2] h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="px-3.5 pb-3.5 pt-1">
                    <Separator className="mb-3 opacity-60" />

                    {editingRole === "user" ? (
                      <InlineMessageEditor
                        className="max-h-[70dvh]"
                        initialValue={userText}
                        onSave={(newText) => handleSave("user", newText)}
                        onCancel={() => setEditingRole(null)}
                      />
                    ) : (
                      <p className="max-h-[70dvh] overflow-auto whitespace-pre-wrap wrap-break-word font-sans text-sm leading-relaxed text-foreground/90">
                        {userText}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* --- SECCIÓN DEL ASISTENTE --- */}
            <div className="flex flex-col gap-3">
              {editingRole === "assistant" ? (
                <InlineMessageEditor
                  initialValue={responseText}
                  className="min-h-64"
                  onSave={(newText) => handleSave("assistant", newText)}
                  onCancel={() => setEditingRole(null)}
                />
              ) : turn.assistantMessage ? (
                <div className="prose prose-sm dark:prose-invert max-w-none overflow-anchor-none px-1 pb-2">
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

            <div className="flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="icon-[fluent--brain-sparkle-20-regular] h-3.5 w-3.5" />
                Respuesta Generada
              </span>
              <div className="flex items-center gap-1">
                {!isStreaming &&
                  turn.assistantMessage &&
                  setMessages &&
                  editingRole !== "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRole("assistant")}
                      className="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <span className="icon-[lucide--edit-2] h-3.5 w-3.5" />
                      Editar
                    </Button>
                  )}
                {turn.assistantMessage &&
                  !isStreaming &&
                  editingRole !== "assistant" && (
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.isLast !== nextProps.isLast) return false
    if (prevProps.isStreaming !== nextProps.isStreaming && nextProps.isLast)
      return false

    const prevUserText = getMessagePart(prevProps.turn.userMessage, "text")
    const nextUserText = getMessagePart(nextProps.turn.userMessage, "text")
    const prevAsstText = getMessagePart(prevProps.turn.assistantMessage, "text")
    const nextAsstText = getMessagePart(nextProps.turn.assistantMessage, "text")
    const prevReasoning = getMessagePart(
      prevProps.turn.assistantMessage,
      "reasoning"
    )
    const nextReasoning = getMessagePart(
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
