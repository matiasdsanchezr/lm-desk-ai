"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { groupMessagesIntoTurns } from "@/features/chat/utils/messages"
import type { UIDataTypes, UIMessage, UITools } from "ai"
import { useCallback, useMemo, useState } from "react"
import { ChatTurnItem, ChatTurnSkeleton } from "./chat-turn-item"

interface ChatThreadProps {
  messages: UIMessage<unknown, UIDataTypes, UITools>[]
  error: Error | undefined
  isStreaming: boolean
  onSendFollowUp?: (text: string) => void
  setMessages?: (messages: UIMessage<unknown, UIDataTypes, UITools>[]) => void
}

export function ChatThread({
  messages,
  error,
  isStreaming,
  onSendFollowUp,
  setMessages,
}: ChatThreadProps) {
  const [followUpText, setFollowUpText] = useState("")
  const includeReasoning = useChatStore((s) => s.includeReasoning)
  const { setIncludeReasoning } = useChatActions()

  const handleFollowUpSubmit = useCallback(
    (e: React.SubmitEvent | React.KeyboardEvent) => {
      e.preventDefault()
      if (!followUpText.trim() || isStreaming || !onSendFollowUp) return
      onSendFollowUp(followUpText)
      setFollowUpText("")
    },
    [followUpText, isStreaming, onSendFollowUp]
  )

  const visibleMessages = messages
  const turns = useMemo(
    () => groupMessagesIntoTurns(visibleMessages),
    [visibleMessages]
  )

  return (
    <Card className="overflow-hidden border-border/60 shadow-md transition-all">
      <CardHeader className="border-b bg-muted/30 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[fluent--brain-sparkle-20-regular]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Respuesta generada
              </CardTitle>
              <CardDescription className="text-xs">
                Análisis basado en el contexto proporcionado
              </CardDescription>
            </div>
          </div>
          {messages.length > 0 && (
            <Badge variant="outline" className="h-6 gap-1 bg-background/50">
              {isStreaming ? (
                <span className="icon-[fa7-solid--spinner] animate-spin text-[10px] text-primary" />
              ) : (
                <span className="icon-[fa7-solid--check-double] text-[10px] text-green-600" />
              )}
              {isStreaming ? "Generando..." : "Completado"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-50 transition-all duration-500 ease-in-out">
          {turns.length > 0 ? (
            <div className="flex flex-col">
              {turns.map((turn, index) => (
                <ChatTurnItem
                  key={turn.id}
                  title={`Consulta ${index + 1}`}
                  turn={turn}
                  isStreaming={isStreaming}
                  isLast={index === turns.length - 1}
                  messages={messages}
                  setMessages={setMessages}
                />
              ))}
              {error && (
                <div className="p-6">
                  <Alert
                    variant="destructive"
                    className="flex items-center border-destructive/20 bg-destructive/5"
                  >
                    <span className="icon-[fa7-solid--circle-exclamation] text-destructive" />
                    <AlertDescription className="ml-2 font-medium">
                      {error.message ?? "Ha ocurrido un error inesperado."}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          ) : isStreaming ? (
            <div className="p-6">
              <ChatTurnSkeleton />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert
                variant="destructive"
                className="flex items-center border-destructive/20 bg-destructive/5"
              >
                <span className="icon-[fa7-solid--circle-exclamation] text-destructive" />
                <AlertDescription className="ml-2 font-medium">
                  {error.message ?? "Ha ocurrido un error inesperado."}
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </div>

        {messages.length > 0 && onSendFollowUp && (
          <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 p-4 sm:p-5">
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                id="include-reasoning"
                checked={includeReasoning}
                onCheckedChange={(val) => setIncludeReasoning(Boolean(val))}
                disabled={isStreaming}
              />
              <Label
                htmlFor="include-reasoning"
                className="cursor-pointer select-none text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Incluir el razonamiento de respuestas anteriores como contexto
              </Label>
            </div>

            <form
              onSubmit={handleFollowUpSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <Textarea
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Escribe una pregunta de seguimiento (Ej: 'Explícame la función handleCopy')..."
                disabled={isStreaming}
                className="min-h-16 flex-1 resize-y bg-background text-xs shadow-sm focus-visible:ring-primary/50 md:text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleFollowUpSubmit(e)
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!followUpText.trim() || isStreaming}
                className="h-10 gap-2 px-5 shadow-sm sm:self-stretch"
              >
                {isStreaming ? (
                  <span className="icon-[fa7-solid--spinner] animate-spin" />
                ) : (
                  <span className="icon-[fa7-solid--paper-plane]" />
                )}
                <span>Enviar</span>
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
