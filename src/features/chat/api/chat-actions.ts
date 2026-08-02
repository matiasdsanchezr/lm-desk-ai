"use server"

import * as chatApi from "@/entities/chat/api/chat-api"
import type {
  SaveChatInput,
  SavedChat,
  SavedChatMeta,
  UpdateChatInput,
} from "@/entities/chat/model/types"
import { ActionState } from "@/shared/types/action-state"
import { revalidatePath } from "next/cache"
import { cache } from "react"

export const saveChat = async (
  data: SaveChatInput
): Promise<ActionState<{ id: string }>> => {
  try {
    const result = await chatApi.saveChat(data)
    revalidatePath("/chat")
    return { data: { id: result.id } }
  } catch (error) {
    console.error("Error al guardar el chat:", error)
    return { error: "No se pudo guardar el chat" }
  }
}

export const loadChat = async (id: string): Promise<ActionState<SavedChat>> => {
  try {
    const result = await chatApi.getChatById(id)
    return { data: result }
  } catch {
    return { error: "No se pudo cargar el chat especificado" }
  }
}

export const listChats = cache(
  async (): Promise<ActionState<SavedChatMeta[]>> => {
    try {
      const result = await chatApi.getChatsList()
      return { data: result }
    } catch (error) {
      console.error("Error al listar los chats:", error)
      return { error: "No se pudieron listar los chats" }
    }
  }
)

export const deleteChat = async (id: string): Promise<ActionState<void>> => {
  try {
    await chatApi.deleteChat(id)
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
    await chatApi.updateChat(id, updates)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    console.error(`Error al actualizar el chat ${id}:`, error)
    return { error: "No se pudo actualizar el chat" }
  }
}
