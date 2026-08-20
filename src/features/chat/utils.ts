import { UIMessage } from "ai"
import { ChatTurn, FormatOptions } from "./types"

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

function normalizeCodeBlocks(content: string): string {
  const codeBlockCount = (content.match(/```/g) || []).length
  if (codeBlockCount % 2 !== 0) {
    return `${content.trimEnd()}\n\`\`\``
  }
  return content
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
