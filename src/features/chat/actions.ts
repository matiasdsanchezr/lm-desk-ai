"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { revalidatePath, updateTag } from "next/cache"
import * as historyService from "./services/history-service"
import type { Chat, CreateChatInput, UpdateChatInput } from "./types"

export const saveChat = async (data: CreateChatInput): ActionResponse<Chat> => {
  try {
    const result = await historyService.createChat(data)
    updateTag("chat-list")
    if (result.id) {
      updateTag(`chat-${result.id}`)
    }

    revalidatePath("/chat", "layout")
    return { data: result }
  } catch {
    return { error: "No se pudo guardar la sesión" }
  }
}

export const deleteChat = async (id: string): ActionResponse<void> => {
  try {
    await historyService.deleteChat(id)
    updateTag("chat-list")
    updateTag(`chat-${id}`)
    revalidatePath("/chat", "layout")
    return {}
  } catch {
    return { error: "No se pudo eliminar la sesión" }
  }
}

export const updateChat = async (
  id: string,
  updates: UpdateChatInput
): ActionResponse<void> => {
  try {
    await historyService.updateChat(id, updates)
    updateTag("chat-list")
    updateTag(`chat-${id}`)

    revalidatePath(`/chat/${id}`, "layout")
    return {}
  } catch (error) {
    console.error(error)
    return { error: "No se pudo actualizar la sesión" }
  }
}
