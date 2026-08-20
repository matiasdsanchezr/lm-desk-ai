"use client"

import { Button } from "@/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import { cn } from "@/shared/lib/utils"
import { useState } from "react"
import { useChatCompletion } from "../providers/chat-completion-provider"
import { ContextBuilder } from "./builder/context-builder"
import { GeneratedPrompt } from "./builder/generated-prompt"
import { PromptReviewer } from "./builder/prompt-reviewer"
import { ChatMobileHeader } from "./chat-mobile-header"
import { ChatThread } from "./thread/chat-thread"

export function ChatWorkspace() {
  const { messages } = useChatCompletion()
  const hasMessages = messages.length > 0
  const [isBuilderOpen, setIsBuilderOpen] = useState(true)

  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-4 md:gap-6">
      <ChatMobileHeader />
      <Collapsible
        open={hasMessages ? isBuilderOpen : true}
        onOpenChange={setIsBuilderOpen}
        className={cn(
          "rounded-xl transition-all duration-200",
          hasMessages
            ? "border border-border/50 bg-muted/20"
            : "border-0 bg-transparent"
        )}
      >
        {hasMessages && (
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="icon-[lucide--settings-2] size-4 text-primary" />
              <span>Configuración del Contexto</span>
            </div>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                >
                  <span>{isBuilderOpen ? "Ocultar" : "Mostrar contexto"}</span>
                  <span
                    className={cn(
                      "icon-[lucide--chevron-down] size-3.5 transition-transform duration-200",
                      isBuilderOpen && "rotate-180"
                    )}
                  />
                </Button>
              }
            />
          </div>
        )}

        <CollapsibleContent
          className={cn("space-y-4", hasMessages ? "p-3 pt-0" : "p-0")}
        >
          <ContextBuilder />
          <PromptReviewer>
            <GeneratedPrompt />
          </PromptReviewer>
        </CollapsibleContent>
      </Collapsible>

      <ChatThread />
    </div>
  )
}
