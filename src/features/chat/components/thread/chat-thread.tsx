"use client"

import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { useCallback, useState } from "react"
import { updateChat } from "../../actions"
import { useAutoScroll } from "../../hooks/use-auto-scroll"
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard"
import { useChatCompletion } from "../../providers/chat-completion-provider"
import { formatConversationToMarkdown } from "../../utils"
import { ChatMessageItem } from "./chat-message-item"
import { ChatThreadHeader } from "./chat-thread-header"

export function ChatThread() {
  const { isCopied, copy } = useCopyToClipboard()
  const {
    messages,
    error,
    isStreaming,
    setMessages,
    chat: initialChat,
  } = useChatCompletion()

  const [allExpanded, setAllExpanded] = useState<boolean | null>(null)

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

  const handleExportMarkdown = useCallback(() => {
    if (!messages.length) return
    copy(formatConversationToMarkdown(messages))
  }, [messages, copy])

  const handleToggleExpandAll = useCallback(() => {
    setAllExpanded((prev) => !prev)
  }, [])

  if (!messages.length && !error) return null

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-xs backdrop-blur-xs">
      {/* Header moderno */}
      <ChatThreadHeader
        messageCount={messages.length}
        isCopied={isCopied}
        onExportMarkdown={handleExportMarkdown}
        onToggleExpandAll={handleToggleExpandAll}
        allExpanded={Boolean(allExpanded)}
      />

      {/* Contenedor con Scroll de Mensajes */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-3 sm:p-4"
      >
        {messages.length > 0 && (
          <div className="flex flex-col gap-2.5">
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
              <AlertDescription className="ml-2 font-medium text-xs">
                {error.message ??
                  "Ha ocurrido un error inesperado al procesar la respuesta."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Botón flotante para regresar al fondo */}
        {!isAtBottom && messages.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAtBottom(true)
              scrollToBottom(true)
            }}
            className="absolute right-4 bottom-4 z-20 h-8 gap-1.5 rounded-full border-border/80 bg-background/90 px-3 text-xs shadow-lg backdrop-blur-md hover:bg-background"
          >
            <span className="icon-[lucide--arrow-down] size-3.5" />
            <span className="hidden sm:inline">Ir al final</span>
          </Button>
        )}
      </div>
    </div>
  )
}
