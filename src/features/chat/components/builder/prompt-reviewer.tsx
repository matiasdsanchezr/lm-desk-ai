"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import React from "react"
import { useChatCompletion } from "../../providers/chat-completion-provider"
import { useChatActions, useChatStore } from "../../store/chat-store"

interface PromptReviewerProps {
  children?: React.ReactNode
}

export const PromptReviewer = ({ children }: PromptReviewerProps) => {
  const { resetGeneratedPrompts: resetGeneratedPrompt, resetAll } =
    useChatActions()
  const resetFiles = useFileExplorerStore((s) => s.resetState)
  const { isStreaming, generateContent, stop, messages } = useChatCompletion()
  const exportablePrompt = useChatStore((s) => s.exportablePrompt)
  const isReadyToReview = Boolean(exportablePrompt)
  const disabled = messages.length > 0

  const handleModifyQuery = () => {
    resetGeneratedPrompt()
  }

  const handleResetAll = () => {
    resetAll()
    resetFiles()
  }

  if (!isReadyToReview) {
    return null
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
              disabled={isStreaming || disabled}
              className="inline-flex items-center gap-2 px-5"
              onClick={generateContent}
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
              Modificar contexto
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
