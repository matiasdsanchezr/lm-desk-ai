"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { memo, useState } from "react"
import type { ChatTurn } from "../../types"
import { AssistantTurnMessage } from "./assistant-turn-message"
import { UserTurnMessage } from "./user-turn-message"

export function ChatTurnSkeleton() {
  return (
    <div className="space-y-4 px-1 py-2">
      <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
    </div>
  )
}

interface ChatTurnItemProps {
  title: string
  turn: ChatTurn
  isStreaming: boolean
  isLast: boolean
  onEditMessage?: (messageId: string, newText: string) => void
  onDeleteTurn?: (userMsgId?: string, asstMsgId?: string) => void
}

export const ChatTurnItem = memo(function ChatTurnItem({
  title,
  turn,
  isStreaming,
  isLast,
  onEditMessage,
  onDeleteTurn,
}: ChatTurnItemProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group border-b border-border/40 bg-muted/5 last:border-0 [contain-intrinsic-size:auto_300px] [content-visibility:auto]"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <span className="icon-[ic--outline-question-answer]" />
          </div>
          <span className="truncate text-sm font-medium text-foreground">
            {title || "Consulta de Usuario"}
          </span>
        </div>
        <span className="icon-[lucide--chevron-down] size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="relative overflow-hidden bg-background data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="flex flex-col gap-6 px-2 py-4 md:px-4">
          <UserTurnMessage
            message={turn.userMessage}
            isStreaming={isStreaming}
            onEditMessage={onEditMessage}
          />

          {turn.assistantMessage ? (
            <AssistantTurnMessage
              message={turn.assistantMessage}
              isStreaming={isStreaming}
              isLast={isLast}
              onEditMessage={onEditMessage}
              onDeleteTurn={
                onDeleteTurn
                  ? () =>
                      onDeleteTurn(
                        turn.userMessage?.id,
                        turn.assistantMessage?.id
                      )
                  : undefined
              }
            />
          ) : isStreaming && isLast ? (
            <ChatTurnSkeleton />
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
})
