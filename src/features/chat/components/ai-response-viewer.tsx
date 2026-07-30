// src/features/chat/components/ai-response-viewer.tsx
"use client"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { createCodePlugin } from "@streamdown/code"
import { UIDataTypes, UIMessage, UITools } from "ai"
import { useState } from "react"
import { Streamdown } from "streamdown"

// --- Subcomponente para renderizar cada Turno (Pregunta + Respuesta) ---
interface ChatTurnItemProps {
  turn: {
    id: string
    userMessage?: UIMessage<unknown, UIDataTypes, UITools>
    assistantMessage?: UIMessage<unknown, UIDataTypes, UITools>
  }
  isStreaming: boolean
  isLast: boolean
}

const ChatTurnItem = ({ turn, isStreaming, isLast }: ChatTurnItemProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  // Extraer y limpiar el texto del usuario
  const rawUserText =
    turn.userMessage?.parts
      ?.filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join("") ?? ""

  let displayUserText = rawUserText
  if (displayUserText.includes("[Pregunta de seguimiento]:")) {
    displayUserText = displayUserText
      .split("[Pregunta de seguimiento]:")[1]
      .trim()
  }

  // Procesar el mensaje del asistente
  let reasoningText = ""
  let responseText = ""

  if (turn.assistantMessage?.parts) {
    for (const part of turn.assistantMessage.parts) {
      if (part.type === "reasoning") {
        reasoningText += (reasoningText ? "\n" : "") + part.text
      } else if (part.type === "text") {
        responseText += (responseText ? " " : "") + part.text
      }
    }
  }

  const handleCopy = async () => {
    if (!responseText) return
    try {
      await navigator.clipboard.writeText(responseText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar al portapapeles", err)
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group border-b border-border/40 bg-muted/5 last:border-0"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/20 focus-visible:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1">
        <div className="flex items-center gap-3 overflow-hidden">
          {turn.userMessage ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <span className="icon-[lucide--user] text-xs" />
            </div>
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <span className="icon-[fluent--brain-sparkle-20-regular] text-xs" />
            </div>
          )}
          <span className="truncate font-medium text-sm text-foreground">
            {displayUserText || "Análisis Principal"}
          </span>
        </div>
        <span className="icon-[lucide--chevron-down] h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="relative overflow-hidden bg-background data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="py-4 px-1 md:px-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Respuesta Generada
            </span>

            {turn.assistantMessage && !isStreaming && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
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

          {turn.assistantMessage ? (
            <div className="prose prose-sm dark:prose-invert overflow-anchor-none max-w-none pb-2">
              {reasoningText && (
                <Reasoning
                  className="mb-4 w-full"
                  isStreaming={isStreaming && isLast}
                >
                  <ReasoningTrigger />
                  <ReasoningContent>{reasoningText}</ReasoningContent>
                </Reasoning>
              )}
              <Streamdown
                plugins={{
                  code: createCodePlugin({
                    themes: ["github-light", "github-dark"],
                  }),
                }}
              >
                {responseText}
              </Streamdown>
            </div>
          ) : isStreaming && isLast ? (
            <div className="space-y-4 py-2">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// --- Componente Principal ---
interface AIResponseSectionProps {
  messages: UIMessage<unknown, UIDataTypes, UITools>[]
  error: Error | undefined
  isStreaming: boolean
  onSendFollowUp?: (text: string) => void
}

export const AIResponseViewer = ({
  messages,
  error,
  isStreaming,
  onSendFollowUp,
}: AIResponseSectionProps) => {
  const [followUpText, setFollowUpText] = useState("")
  const includeReasoning = useChatStore((s) => s.includeReasoning)
  const { setIncludeReasoning } = useChatActions()

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!followUpText.trim() || isStreaming || !onSendFollowUp) return
    onSendFollowUp(followUpText)
    setFollowUpText("")
  }

  // Agrupar mensajes en "Turnos"
  const turns: Array<{
    id: string
    userMessage?: UIMessage<unknown, UIDataTypes, UITools>
    assistantMessage?: UIMessage<unknown, UIDataTypes, UITools>
  }> = []

  const visibleMessages = messages.slice(1)
  let currentTurn: (typeof turns)[0] | null = null

  visibleMessages.forEach((msg) => {
    if (msg.role === "user") {
      if (currentTurn) turns.push(currentTurn)
      currentTurn = { id: msg.id, userMessage: msg }
    } else if (msg.role === "assistant") {
      if (!currentTurn) {
        currentTurn = { id: msg.id, assistantMessage: msg }
      } else {
        currentTurn.assistantMessage = msg
      }
      turns.push(currentTurn)
      currentTurn = null
    }
  })
  if (currentTurn) turns.push(currentTurn)

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
                  turn={turn}
                  isStreaming={isStreaming}
                  isLast={index === turns.length - 1}
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
            <div className="space-y-4 p-6">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
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

        {/* Input para preguntas de seguimiento */}
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
                className="min-h-16 flex-1 resize-y bg-background text-xs shadow-sm md:text-sm focus-visible:ring-primary/50"
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
                className="h-10 gap-2 px-5 sm:self-stretch shadow-sm"
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
