import { UIMessage } from "ai"
import { ChatTurn } from "./types"

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
