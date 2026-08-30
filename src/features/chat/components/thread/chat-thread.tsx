"use client"

import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { useAutoScroll } from "@/shared/hooks/use-auto-scroll"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useOptimistic, useState } from "react"
import { updateChat } from "../../actions/chat-actions"
import { useChatCompletion } from "../../providers/chat-completion-provider"
import { estimateTokenCountFromUIMessage } from "../../utils/chat-utils"
import { ChatMessageItem } from "./chat-message-item"
import { ChatThreadHeader } from "./chat-thread-header"

export function ChatThread() {
  const router = useRouter()
  const {
    messages,
    error,
    isStreaming,
    setMessages,
    chat: initialChat,
  } = useChatCompletion()

  const [allExpanded, setAllExpanded] = useState<boolean | null>(null)

  const [optimisticTitle, setOptimisticTitle] = useOptimistic(
    initialChat?.title || "Nueva Sesión",
    (_current, newTitle: string) => newTitle
  )

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

  const handleUpdateTitle = useCallback(
    async (newTitle: string) => {
      if (!initialChat?.id) return
      setOptimisticTitle(newTitle)
      const res = await updateChat(initialChat.id, { title: newTitle })
      if (!res.error) {
        router.refresh()
      }
    },
    [initialChat, router, setOptimisticTitle]
  )

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

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      const updated = messages.filter((msg) => msg.id !== messageId)
      setMessages(updated)
      if (initialChat?.id) {
        updateChat(initialChat.id, { messages: updated })
      }
    },
    [messages, initialChat, setMessages]
  )

  const handleToggleExpandAll = useCallback(() => {
    setAllExpanded((prev) => !prev)
  }, [])

  const totalTokens = useMemo(() => {
    return estimateTokenCountFromUIMessage(messages)
  }, [messages])

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent">
      {/* Header con título editable optimista */}
      <ChatThreadHeader
        title={optimisticTitle}
        tokenCount={totalTokens}
        messageCount={messages.length}
        onToggleExpandAll={handleToggleExpandAll}
        allExpanded={Boolean(allExpanded)}
        onUpdateTitle={initialChat?.id ? handleUpdateTitle : undefined}
        isEditable={Boolean(initialChat?.id)}
      />

      {/* Contenedor con Scroll de Mensajes */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 p-3 sm:p-6">
          {messages.length > 0 && (
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming}
                  isLast={index === messages.length - 1}
                  forcedExpandState={allExpanded}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                />
              ))}
              <div ref={endRef} className="h-px" />
            </div>
          )}

          {/* Error en tiempo de ejecución */}
          {error && (
            <div className="pt-2">
              <Alert
                variant="destructive"
                className="flex items-center border-destructive/20 bg-destructive/10"
              >
                <span className="icon-[lucide--alert-triangle] size-4 text-destructive" />
                <AlertDescription className="ml-2 text-xs font-medium">
                  {error.message ??
                    "Ha ocurrido un error inesperado al procesar la respuesta."}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Botón flotante para regresar al fondo */}
        {!isAtBottom && messages.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAtBottom(true)
              scrollToBottom(true)
            }}
            className="absolute right-6 bottom-4 z-20 h-8 gap-1.5 rounded-full border-border/80 bg-background/90 px-3 text-xs shadow-lg backdrop-blur-md hover:bg-background"
          >
            <span className="icon-[lucide--arrow-down] size-3.5" />
            <span className="hidden sm:inline">Ir al final</span>
          </Button>
        )}
      </div>
    </div>
  )
}
