import { config } from "@/shared/lib/config"
import type { UIMessage } from "@ai-sdk/react"
import { mkdir } from "fs/promises"
import path from "path"
import type { ChatTurn } from "../model/types"

export const GENERATED_DIR = path.join(config.STORAGE_PATH, "chats")

export async function ensureDirectoryExists() {
  await mkdir(GENERATED_DIR, { recursive: true })
}

/**
 * Agrupa mensajes user/assistant en turnos de conversación
 */
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
