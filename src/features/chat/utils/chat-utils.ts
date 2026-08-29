import type { FileContent } from "@/shared/services/file-service"
import type { UIMessage } from "ai"
import type { FormatOptions } from "../types"

export function getMessagePart(
  message: UIMessage | undefined,
  type: "text" | "reasoning"
): string {
  if (!message?.parts) return ""

  return message.parts
    .filter((p) => p.type === type)
    .map((p) => (p as { text: string }).text)
    .join(type === "text" ? "" : "\n")
}

export function estimateTokenCountFromText(input: string): number {
  return Math.ceil(input.length / 4)
}

export function estimateTokenCountFromUIMessage(input: UIMessage[]): number {
  let totalChars = 0
  for (const msg of input) {
    if (!msg.parts) continue
    for (const part of msg.parts) {
      if ("text" in part && typeof part.text === "string") {
        totalChars += part.text.length
      }
    }
  }

  return Math.ceil(totalChars / 4)
}

function normalizeCodeBlocks(content: string): string {
  const codeBlockCount = (content.match(/```/g) || []).length
  return codeBlockCount % 2 !== 0 ? `${content.trimEnd()}\n\`\`\`` : content
}

export function formatConversationToMarkdown(
  messages: UIMessage[],
  options: FormatOptions = {}
): string {
  const {
    userLabel = "**Usuario:**",
    assistantLabel = "**Asistente:**",
    systemLabel = "**Sistema:**",
  } = options

  const roleMap: Record<string, string> = {
    user: userLabel,
    assistant: assistantLabel,
    system: systemLabel,
  }

  return messages
    .filter((msg) => msg.parts.length > 0)
    .map((msg) => {
      const label = roleMap[msg.role] || `**${msg.role}:**`
      const content = getMessagePart(msg, "text")
      const safeContent = normalizeCodeBlocks(content.trim())

      const contextFilesPart = msg.parts?.find(
        (p) => p.type === "data-contextFiles"
      ) as { type: string; data: FileContent[] } | undefined
      const contextFiles = contextFilesPart?.data ?? []

      let contextSection = ""
      if (contextFiles.length > 0) {
        contextSection =
          `\n\n> **Archivos de contexto adjuntos (${contextFiles.length}):**\n` +
          contextFiles.map((f) => `> - \`${f.path}\``).join("\n")
      }

      return `${label}\n\n${safeContent}${contextSection}`
    })
    .join("\n\n---\n\n")
}
