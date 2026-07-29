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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { createCodePlugin } from "@streamdown/code"
import { UIDataTypes, UIMessage, UITools } from "ai"
import { useState } from "react"
import { Streamdown } from "streamdown"

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
                Respuesta basada en el contexto proporcionado
              </CardDescription>
            </div>
          </div>
          {messages.length > 0 && (
            <Badge variant="outline" className="h-6 gap-1 bg-background/50">
              <span className="icon-[fa7-solid--check-double] text-[10px] text-green-600" />
              {isStreaming ? "Generando..." : "Completado"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-50 transition-all duration-500 ease-in-out">
          {messages.length > 0 ? (
            <div className="flex flex-col divide-y divide-border/40">
              {messages.map((message, index) => {
                if (message.role === "user") {
                  if (index === 0) return null

                  const userText =
                    message.parts
                      ?.filter((p) => p.type === "text")
                      .map((p) => (p as { text: string }).text)
                      .join("") ?? ""

                  return (
                    <div
                      key={message.id || index}
                      className="flex items-start gap-3 bg-muted/20 p-4 font-sans text-sm"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="icon-[lucide--user] text-xs" />
                      </div>
                      <div className="flex-1 pt-1 font-medium text-foreground">
                        {userText}
                      </div>
                    </div>
                  )
                }

                if (message.role === "assistant") {
                  let reasoningText = ""
                  let responseText = ""

                  if (message.parts && message.parts.length > 0) {
                    for (const part of message.parts) {
                      if (part.type === "reasoning") {
                        reasoningText += (reasoningText ? "\n" : "") + part.text
                      } else if (part.type === "text") {
                        responseText += (responseText ? " " : "") + part.text
                      }
                    }
                  }

                  const isLastAssistant = index === messages.length - 1

                  return (
                    <div
                      key={message.id || index}
                      className="prose prose-sm dark:prose-invert overflow-anchor-none max-w-none p-6"
                    >
                      {reasoningText && (
                        <Reasoning
                          className="w-full"
                          isStreaming={isStreaming && isLastAssistant}
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
                  )
                }

                return null
              })}
            </div>
          ) : isStreaming ? (
            <div className="space-y-4 p-6">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="p-6">
              <Alert
                variant="destructive"
                className="flex items-center border-destructive/20 bg-destructive/5"
              >
                <span className="icon-[fa7-solid--circle-exclamation] text-destructive" />
                <AlertDescription className="ml-2 font-medium">
                  {error?.message ?? "Ha ocurrido un error inesperado."}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Input para preguntas de seguimiento (Multi-turn) */}
        {messages.length > 0 && onSendFollowUp && (
          <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-reasoning"
                checked={includeReasoning}
                onCheckedChange={(val) => setIncludeReasoning(Boolean(val))}
                disabled={isStreaming}
              />
              <Label
                htmlFor="include-reasoning"
                className="cursor-pointer select-none text-xs text-muted-foreground"
              >
                Incluir el razonamiento de las respuestas anteriores en el
                seguimiento
              </Label>
            </div>

            <form
              onSubmit={handleFollowUpSubmit}
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <Textarea
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Escribe una pregunta de seguimiento sobre este código/respuesta..."
                disabled={isStreaming}
                className="min-h-16 flex-1 resize-none text-xs md:text-sm"
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
                className="h-10 gap-2 px-4 sm:self-stretch"
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
