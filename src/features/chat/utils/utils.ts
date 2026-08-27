import { UIMessage } from "ai"
import { ChatTurn, FormatOptions } from "../types"

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

export function estimateTokenCount(input: string | UIMessage[]): number {
  if (typeof input === "string") {
    return Math.ceil(input.length / 4)
  }

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

function normalizeCodeBlocks(content: string): string {
  const codeBlockCount = (content.match(/```/g) || []).length
  return codeBlockCount % 2 !== 0 ? `${content.trimEnd()}\n\`\`\`` : content
}

export function formatConversationToMarkdown(
  messages: UIMessage[],
  options: FormatOptions = {}
): string {
  const {
    userLabel = "**👤 Usuario:**",
    assistantLabel = "**🤖 Asistente:**",
    systemLabel = "**⚙️ Sistema:**",
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

      return `${label}\n\n${safeContent}`
    })
    .join("\n\n---\n\n")
}
