"use client"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/shared/components/ai-elements/reasoning"
import { createCodePlugin } from "@streamdown/code"
import type { UIMessage } from "ai"
import { memo } from "react"
import { Streamdown } from "streamdown"

const codePlugin = createCodePlugin({
  themes: ["github-light", "github-dark"],
})

interface AssistantMessageContentProps {
  text: string
  reasoning?: string
  isStreaming: boolean
  isLast: boolean
  message: UIMessage
}

export const AssistantMessageContent = memo(function AssistantMessageContent({
  text,
  reasoning,
  isStreaming,
  isLast,
}: AssistantMessageContentProps) {
  return (
    <div className="flex flex-col gap-2">
      {reasoning && (
        <Reasoning
          className="mb-2 w-full rounded-lg border border-border/50 bg-muted/20"
          isStreaming={isStreaming && isLast}
        >
          <ReasoningTrigger className="px-3 py-2 text-xs font-medium text-muted-foreground" />
          <ReasoningContent className="px-3 pb-3 text-xs">
            {reasoning}
          </ReasoningContent>
        </Reasoning>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none px-0.5 text-xs sm:text-sm overflow-anchor-none">
        <Streamdown plugins={{ code: codePlugin }}>{text}</Streamdown>
      </div>
    </div>
  )
})
