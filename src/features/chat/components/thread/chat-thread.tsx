"use client"

import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { updateChat } from "../../actions"
import { useChatCompletion } from "../../providers/chat-completion-provider"
import { useChatActions, useChatStore } from "../../store/chat-store"
import {
  formatConversationToMarkdown,
  getMessagePart,
  groupMessagesIntoTurns,
} from "../../utils"
import { ChatTurnItem, ChatTurnSkeleton } from "./chat-turn-item"

export function ChatThread() {
  const [followUpText, setFollowUpText] = useState("")
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isCopiedAll, setIsCopiedAll] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const includeReasoning = useChatStore((s) => s.includeReasoningHistory)
  const { setIncludeReasoningHistory: setIncludeReasoning } = useChatActions()
  const {
    messages,
    error,
    isStreaming,
    generateContent,
    setMessages,
    chat: initialChat,
  } = useChatCompletion()

  const latestMessagesRef = useRef(messages)
  useEffect(() => {
    latestMessagesRef.current = messages
  }, [messages])

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    })
  }, [])

  useEffect(() => {
    if (isStreaming && isAtBottom) {
      scrollToBottom(false)
    }
  }, [messages, isStreaming, isAtBottom, scrollToBottom])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    setIsAtBottom(distanceToBottom < 100)
  }, [])

  const handleFollowUpSubmit = useCallback(
    (e: React.SubmitEvent | React.KeyboardEvent) => {
      e.preventDefault()
      if (!followUpText.trim() || isStreaming) return
      generateContent(followUpText)
      setFollowUpText("")
      setIsAtBottom(true)
      setTimeout(() => scrollToBottom(true), 50)
    },
    [followUpText, isStreaming, generateContent, scrollToBottom]
  )

  const handleEditMessage = useCallback(
    (messageId: string, newText: string) => {
      const updated = latestMessagesRef.current.map((msg) => {
        if (msg.id !== messageId) return msg
        const newParts = msg.parts?.map((p) =>
          p.type === "text" ? { ...p, text: newText } : p
        ) ?? [{ type: "text" as const, text: newText }]
        return { ...msg, parts: newParts }
      })
      setMessages(updated)
      if (initialChat?.id) {
        updateChat(initialChat.id, { messages: updated })
      }
    },
    [setMessages, initialChat]
  )

  const handleDeleteTurn = useCallback(
    (userMsgId?: string, asstMsgId?: string) => {
      const idsToRemove = [userMsgId, asstMsgId].filter(Boolean)
      const updated = latestMessagesRef.current.filter(
        (msg) => !idsToRemove.includes(msg.id)
      )
      setMessages(updated)
      if (initialChat?.id) {
        updateChat(initialChat.id, { messages: updated })
      }
    },
    [initialChat, setMessages]
  )

  const handleRegenerateLastTurn = useCallback(() => {
    if (isStreaming || messages.length === 0) return
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")
    if (!lastUserMessage) return

    const queryText = getMessagePart(lastUserMessage, "text")
    if (!queryText) return

    const filtered = messages.filter(
      (m) => m.id !== messages[messages.length - 1].id
    )
    setMessages(filtered)
    generateContent(queryText, false)
  }, [isStreaming, messages, setMessages, generateContent])

  const handleExportMarkdown = useCallback(async () => {
    if (!messages.length) return
    const mdContent = formatConversationToMarkdown(messages)

    try {
      await navigator.clipboard.writeText(mdContent)
      setIsCopiedAll(true)
      setTimeout(() => setIsCopiedAll(false), 2000)
    } catch (err) {
      console.error("Error al exportar:", err)
    }
  }, [messages])

  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages])

  if (!messages.length && !error) {
    return null
  }

  return (
    <Card className="relative overflow-hidden border-border/60 shadow-md transition-all">
      <CardHeader className="border-b bg-muted/30 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[mingcute--chat-2-ai-line]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Conversación
              </CardTitle>
              <CardDescription className="text-xs">
                {turns.length}{" "}
                {turns.length === 1 ? "interacción" : "interacciones"} en este
                hilo
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMarkdown}
                className="h-7 gap-1.5 text-xs font-medium"
                title="Copiar conversación completa en Markdown"
              >
                <span
                  className={
                    isCopiedAll
                      ? "icon-[fa7-solid--check] text-green-500"
                      : "icon-[lucide--copy]"
                  }
                />
                <span className="hidden sm:inline">
                  {isCopiedAll ? "Copiado" : "Exportar Markdown"}
                </span>
              </Button>
            )}

            <Badge
              variant="outline"
              className="h-7 gap-1 bg-background/50 text-xs"
            >
              {isStreaming ? (
                <>
                  <span className="icon-[fa7-solid--spinner] animate-spin text-[10px] text-primary" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span className="icon-[fa7-solid--check-double] text-[10px] text-green-600" />
                  <span>Listo</span>
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="relative max-h-[90dvh] overflow-y-auto"
        >
          {turns.length > 0 ? (
            <div className="flex flex-col">
              {turns.map((turn, index) => (
                <ChatTurnItem
                  key={turn.id}
                  title={`Consulta ${index + 1}`}
                  turn={turn}
                  isStreaming={isStreaming}
                  isLast={index === turns.length - 1}
                  onEditMessage={handleEditMessage}
                  onDeleteTurn={handleDeleteTurn}
                  onRegenerate={
                    index === turns.length - 1
                      ? handleRegenerateLastTurn
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          ) : isStreaming ? (
            <div className="p-6">
              <ChatTurnSkeleton />
            </div>
          ) : null}

          {error && (
            <div className="p-4 sm:p-6">
              <Alert
                variant="destructive"
                className="flex items-center border-destructive/20 bg-destructive/5"
              >
                <span className="icon-[fa7-solid--circle-exclamation] text-destructive" />
                <AlertDescription className="ml-2 font-medium">
                  {error.message ??
                    "Ha ocurrido un error inesperado al procesar la respuesta."}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Botón flotante para descender rápidamente */}
          {!isAtBottom && turns.length > 0 && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setIsAtBottom(true)
                scrollToBottom(true)
              }}
              className="absolute right-4 bottom-4 size-8 rounded-full shadow-lg backdrop-blur-md bg-background/80 hover:bg-background z-20"
              title="Ir al final"
            >
              <span className="icon-[lucide--arrow-down] size-4" />
            </Button>
          )}
        </div>

        {/* Formulario de Nueva Consulta */}
        <div className="border-t border-border/60 bg-muted/20 p-4 sm:p-5">
          <form
            onSubmit={handleFollowUpSubmit}
            className="group relative flex flex-col rounded-xl border border-border/80 bg-background/95 p-3 shadow-xs transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 hover:border-border"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                <span className="icon-[lucide--messages-square] h-4 w-4 text-primary" />
                <span>Continuar conversación</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1 transition-colors hover:bg-muted/80">
                <Checkbox
                  id="include-reasoning"
                  checked={includeReasoning}
                  onCheckedChange={(val) => setIncludeReasoning(Boolean(val))}
                  disabled={isStreaming}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor="include-reasoning"
                  className="cursor-pointer select-none text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Incluir razonamientos previos
                </Label>
              </div>
            </div>

            <Textarea
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder="Escribe tu consulta adicional... (Ej: 'Optimiza esta función para Node 22')"
              disabled={isStreaming}
              rows={2}
              className="min-h-18 w-full rounded-none resize-none border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleFollowUpSubmit(e)
                }
              }}
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/30 pt-2">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="icon-[lucide--corner-down-left] h-3 w-3 text-muted-foreground/70" />
                <span>
                  <kbd className="rounded border bg-muted/80 px-1 font-mono text-[10px]">
                    Enter
                  </kbd>{" "}
                  para enviar ·{" "}
                  <kbd className="rounded border bg-muted/80 px-1 font-mono text-[10px]">
                    Shift + Enter
                  </kbd>{" "}
                  salto de línea
                </span>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={!followUpText.trim() || isStreaming}
                className="h-8.5 gap-2 px-4 shadow-sm transition-all active:scale-95"
              >
                {isStreaming ? (
                  <>
                    <span className="icon-[fa7-solid--spinner] h-3.5 w-3.5 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar</span>
                    <span className="icon-[lucide--send] h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
