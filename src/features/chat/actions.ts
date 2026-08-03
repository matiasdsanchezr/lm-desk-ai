"use server"

import { ActionState } from "@/shared/types/action-state"
import { revalidatePath } from "next/cache"
import * as historyService from "./services/history-service"
import type { SaveChatInput, UpdateChatInput } from "./types"

export const saveChat = async (
  data: SaveChatInput
): Promise<ActionState<{ id: string }>> => {
  try {
    const result = await historyService.createChat(data)
    revalidatePath("/chat")
    return { data: { id: result.id } }
  } catch (error) {
    console.error("Error al guardar el chat:", error)
    return { error: "No se pudo guardar el chat" }
  }
}

export const deleteChat = async (id: string): Promise<ActionState<void>> => {
  try {
    await historyService.deleteChat(id)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    console.error(`Error al eliminar el chat ${id}:`, error)
    return { error: "No se pudo eliminar el chat" }
  }
}

export const updateChat = async (
  id: string,
  updates: UpdateChatInput
): Promise<ActionState<void>> => {
  try {
    await historyService.updateChat(id, updates)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    console.error(`Error al actualizar el chat ${id}:`, error)
    return { error: "No se pudo actualizar el chat" }
  }
}
