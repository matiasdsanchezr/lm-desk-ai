import "server-only"

import { cache } from "react"
import * as historyService from "./services/history-service"
import type { Chat, ChatMeta } from "./types"

export const getChatList = cache(async (): Promise<ChatMeta[]> => {
  try {
    return await historyService.listChats()
  } catch (error) {
    console.error("[Chat Query] Error al listar conversaciones:", error)
    return []
  }
})

export const getChatById = cache(async (id: string): Promise<Chat | null> => {
  if (!id || typeof id !== "string") {
    return null
  }

  try {
    return await historyService.getChatById(id)
  } catch (error) {
    console.error(`[Chat Query] Error al obtener el chat con ID ${id}:`, error)
    return null
  }
})
