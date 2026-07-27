"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useChatActions } from "@/features/chat/store/chat-store"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import React from "react"

interface PromptReviewerProps {
  isStreaming: boolean
  handleSendToAI: () => void
  stop: () => void
  children?: React.ReactNode
}

export const PromptReviewer = ({
  isStreaming,
  handleSendToAI,
  stop,
  children,
}: PromptReviewerProps) => {
  const { clearPrompts, resetAll: resetAllChat } = useChatActions()
  const resetFiles = useFileExplorerStore((s) => s.resetFiles)

  const handleModifyQuery = () => {
    clearPrompts()
  }

  const handleResetAll = () => {
    resetAllChat()
    resetFiles()
  }

  return (
    <Card className="animate-in border-border/60 shadow-sm transition-all duration-300 fade-in-50 slide-in-from-bottom-2">
      <CardHeader className="pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
            <span>Paso 2</span>
          </div>
          <CardTitle className="text-lg font-bold md:text-xl">
            Revisa y utiliza el prompt
          </CardTitle>
          <CardDescription className="text-sm">
            Copia el prompt estructurado para usarlo externamente o envíalo
            directamente a la IA integrada.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}

        <Separator className="my-1" />

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={isStreaming}
              className="inline-flex items-center gap-2 px-5"
              onClick={handleSendToAI}
            >
              {isStreaming ? (
                <>
                  <span className="icon-[fa7-solid--spinner] animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <span className="icon-[fa7-solid--brain]" />
                  Generar Respuesta
                </>
              )}
            </Button>

            {isStreaming && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stop}
                className="inline-flex items-center gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <span className="icon-[fa7-solid--stop]" />
                Detener
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleModifyQuery}
              disabled={isStreaming}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 text-xs sm:flex-initial"
            >
              <span className="icon-[fa7-solid--pencil] text-muted-foreground" />
              Modificar consulta
            </Button>

            <Button
              variant="ghost"
              onClick={handleResetAll}
              disabled={isStreaming}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-destructive/5 hover:text-destructive sm:flex-initial"
            >
              <span className="icon-[fa7-solid--arrow-rotate-left]" />
              Reiniciar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
