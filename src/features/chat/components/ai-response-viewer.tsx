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

interface ChatTurnItemProps {
  turn: {
    id: string
    userMessage?: UIMessage<unknown, UIDataTypes, UITools>
    assistantMessage?: UIMessage<unknown, UIDataTypes, UITools>
  }
  isStreaming: boolean
  isLast: boolean
  messages: UIMessage<unknown, UIDataTypes, UITools>[]
  setMessages?: (messages: UIMessage<unknown, UIDataTypes, UITools>[]) => void
}

const ChatTurnItem = ({
  turn,
  isStreaming,
  isLast,
  messages,
  setMessages,
}: ChatTurnItemProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [userEditText, setUserEditText] = useState("")
  const [isEditingAssistant, setIsEditingAssistant] = useState(false)
  const [assistantEditText, setAssistantEditText] = useState("")

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

  const handleEditUserClick = () => {
    setIsEditingUser(true)
    if (rawUserText.includes("[Pregunta de seguimiento]:")) {
      setUserEditText(displayUserText)
    } else {
      setUserEditText(rawUserText)
    }
  }

  const handleSaveUser = () => {
    if (!turn.userMessage || !setMessages) return
    let finalNewText = userEditText
    if (rawUserText.includes("[Pregunta de seguimiento]:")) {
      finalNewText = `[Pregunta de seguimiento]:\n${userEditText}`
    }

    const updatedMessages = messages.map((msg) => {
      if (msg.id === turn.userMessage!.id) {
        const newParts = msg.parts?.map((p) =>
          p.type === "text" ? { ...p, text: finalNewText } : p
        ) || [{ type: "text", text: finalNewText }]
        return { ...msg, parts: newParts, content: finalNewText }
      }
      return msg
    })
    setMessages(updatedMessages)
    setIsEditingUser(false)
  }

  const handleDeleteTurn = () => {
    if (!setMessages) return
    const idsToRemove = [
      turn.userMessage?.id,
      turn.assistantMessage?.id,
    ].filter(Boolean)
    const updatedMessages = messages.filter(
      (msg) => !idsToRemove.includes(msg.id)
    )
    setMessages(updatedMessages)
  }

  const handleSaveAssistant = () => {
    if (!turn.assistantMessage || !setMessages) return
    const updatedMessages = messages.map((msg) => {
      if (msg.id === turn.assistantMessage!.id) {
        const newParts = msg.parts?.map((p) =>
          p.type === "text" ? { ...p, text: assistantEditText } : p
        ) || [{ type: "text", text: assistantEditText }]
        return { ...msg, parts: newParts, content: assistantEditText }
      }
      return msg
    })
    setMessages(updatedMessages)
    setIsEditingAssistant(false)
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
        <div className="flex flex-col gap-6 py-4 px-2 md:px-4">
          {/* SECCIÓN DEL USUARIO */}
          {turn.userMessage && (
            <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="icon-[lucide--user] h-3 w-3" />
                  Tu Consulta
                </span>
                {!isStreaming && setMessages && (
                  <div className="flex items-center gap-1">
                    {!isEditingUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleEditUserClick}
                        title="Editar consulta"
                      >
                        <span className="icon-[lucide--edit-2] h-3.5 w-3.5" />
                      </Button>
                    )}
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
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {displayUserText}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN DEL ASISTENTE */}
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
              <div className="prose prose-sm dark:prose-invert overflow-anchor-none max-w-none px-1 pb-2">
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
              <div className="space-y-4 px-1 py-2">
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
              </div>
            ) : null}
          </div>
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
  setMessages?: (messages: UIMessage<unknown, UIDataTypes, UITools>[]) => void
}

export const AIResponseViewer = ({
  messages,
  error,
  isStreaming,
  onSendFollowUp,
  setMessages,
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
