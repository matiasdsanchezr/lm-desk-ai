import { ChatTurn } from "@/entities/chat/model/types"
import { FileContent } from "@/entities/file/model/file-types"
import { renderMdTemplate } from "@/shared/lib/render-md-template"
import { UIMessage } from "@ai-sdk/react"
import { DEFAULT_FILE_TEMPLATE } from "./chat-constants"

export function groupMessagesIntoTurns(messages: UIMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = []
  let currentTurn: ChatTurn | null = null

  for (const msg of messages) {
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
  }
  if (currentTurn) turns.push(currentTurn)

  return turns
}

export function getMessagePart(
  message: UIMessage | undefined,
  type: "text" | "reasoning"
): string {
  if (!message?.parts) return ""

  return message.parts
    .filter((p) => p.type === type)
    .map((p) => (p as { text: string }).text)
    .join(type === "text" ? " " : "\n")
}

export const formatFilesContent = (files: FileContent[]): string => {
  const validFiles = files.filter((f) => !f.error && f.content)

  if (validFiles.length === 0) {
    return ""
  }

  const template = DEFAULT_FILE_TEMPLATE
  return validFiles
    .map((file) =>
      renderMdTemplate(template, {
        path: file.path,
        lang: file.language ?? "",
        content: sanitizeXmlContent(file.content ?? ""),
      })
    )
    .join("\n")
}
