"use client"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createCodePlugin } from "@streamdown/code"
import { UIDataTypes, UIMessage, UITools } from "ai"
import { Streamdown } from "streamdown"

interface AIResponseSectionProps {
  messages: UIMessage<unknown, UIDataTypes, UITools>[]
  error: Error | undefined
  isStreaming: boolean
}

export const AIResponseViewer = ({
  messages,
  error,
  isStreaming,
}: AIResponseSectionProps) => {
  const lastMessage = messages[messages.length - 1]

  const reasoningText =
    lastMessage?.parts
      ?.filter((part) => part.type === "reasoning")
      .map((part) => (part.type === "reasoning" ? part.text : ""))
      .join("\n") ?? "Sin razonamiento"

  const responseText =
    lastMessage?.parts
      ?.filter((part) => part.type === "text")
      .map((part) => (part.type === "text" ? part.text : ""))
      .join(" ") ?? "Sin respuesta"

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
          {messages.length > 1 && (
            <Badge variant="outline" className="h-6 gap-1 bg-background/50">
              <span className="icon-[fa7-solid--check-double] text-[10px] text-green-600" />
              Generado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-50 transition-all duration-500 ease-in-out">
          {messages.length > 1 ? (
            <div className="prose prose-sm dark:prose-invert overflow-anchor-none max-w-none p-6">
              <Reasoning className="w-full" isStreaming={isStreaming}>
                <ReasoningTrigger />
                <ReasoningContent>{reasoningText}</ReasoningContent>
              </Reasoning>
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
      </CardContent>
    </Card>
  )
}
