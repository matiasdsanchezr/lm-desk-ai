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
import { useCallback, useMemo } from "react"
import { updateChat } from "../../actions"
import { useAutoScroll } from "../../hooks/use-auto-scroll"
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard"
import { useChatCompletion } from "../../providers/chat-completion-provider"
import {
  formatConversationToMarkdown,
  groupMessagesIntoTurns,
} from "../../utils"
import { ChatTurnItem, ChatTurnSkeleton } from "./chat-turn-item"

export function ChatThread() {
  const { isCopied, copy } = useCopyToClipboard()
  const {
    messages,
    error,
    isStreaming,
    setMessages,
    chat: initialChat,
  } = useChatCompletion()

  const {
    containerRef,
    endRef,
    isAtBottom,
    setIsAtBottom,
    scrollToBottom,
    handleScroll,
  } = useAutoScroll({
    isStreaming,
    dependency: messages,
  })

  const turns = useMemo(() => groupMessagesIntoTurns(messages), [messages])

  const handleEditMessage = useCallback(
    (messageId: string, newText: string) => {
      const updated = messages.map((msg) => {
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
    [messages, setMessages, initialChat]
  )

  const handleDeleteTurn = useCallback(
    (userMsgId?: string, asstMsgId?: string) => {
      const idsToRemove = [userMsgId, asstMsgId].filter(Boolean)
      const updated = messages.filter((msg) => !idsToRemove.includes(msg.id))
      setMessages(updated)
      if (initialChat?.id) {
        updateChat(initialChat.id, { messages: updated })
      }
    },
    [messages, initialChat, setMessages]
  )

  const handleExportMarkdown = useCallback(() => {
    if (!messages.length) return
    copy(formatConversationToMarkdown(messages))
  }, [messages, copy])

  if (!messages.length && !error) return null

  return (
    <Card className="relative overflow-hidden border-border/60 shadow-md transition-all">
      <CardHeader className="border-b bg-muted/30 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                    isCopied
                      ? "icon-[lucide--check] text-emerald-500"
                      : "icon-[lucide--copy]"
                  }
                />
                <span className="hidden sm:inline">
                  {isCopied ? "Copiado" : "Exportar Markdown"}
                </span>
              </Button>
            )}

            <Badge
              variant="outline"
              className="h-7 gap-1 bg-background/50 text-xs"
            >
              {isStreaming ? (
                <>
                  <span className="icon-[lucide--loader-2] size-3 animate-spin text-primary" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span className="icon-[lucide--check-check] size-3 text-emerald-600" />
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
          className="relative max-h-[65dvh] overflow-y-auto"
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
                />
              ))}
              <div ref={endRef} className="h-px" />
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
                <span className="icon-[lucide--alert-circle] size-4 text-destructive" />
                <AlertDescription className="ml-2 font-medium">
                  {error.message ??
                    "Ha ocurrido un error inesperado al procesar la respuesta."}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!isAtBottom && turns.length > 0 && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                setIsAtBottom(true)
                scrollToBottom(true)
              }}
              className="absolute right-4 bottom-4 z-20 size-8 rounded-full bg-background/80 shadow-lg backdrop-blur-md hover:bg-background"
              title="Ir al final"
            >
              <span className="icon-[lucide--arrow-down] size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
