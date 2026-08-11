import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import * as historyService from "./services/history-service"
import type { Chat, ChatMeta } from "./types"

export async function getChatList(): Promise<ChatMeta[]> {
  "use cache"
  cacheTag("chat-list")
  cacheLife("days")

  try {
    return await historyService.listChats()
  } catch (error) {
    console.error("[Chat Query] Error al listar conversaciones:", error)
    return []
  }
}

export async function getChatById(id: string): Promise<Chat | null> {
  if (!id) {
    return null
  }

  try {
    return await historyService.getChatById(id)
  } catch (error) {
    console.error(`[Chat Query] Error al obtener el chat con ID ${id}:`, error)
    return null
  }
}
