"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { revalidatePath } from "next/cache"
import * as historyService from "./services/history-service"
import type { Chat, CreateChatInput, UpdateChatInput } from "./types"

export const saveChat = async (
  data: CreateChatInput
): ActionResponse<Chat> => {
  try {
    const result = await historyService.createChat(data)
    revalidatePath("/chat")
    return { data: result }
  } catch (error) {
    return { error: "No se pudo guardar el chat" }
  }
}

export const deleteChat = async (id: string): ActionResponse<void> => {
  try {
    await historyService.deleteChat(id)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    return { error: "No se pudo eliminar el chat" }
  }
}

export const updateChat = async (
  id: string,
  updates: UpdateChatInput
): ActionResponse<void> => {
  try {
    await historyService.updateChat(id, updates)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    return { error: "No se pudo actualizar el chat" }
  }
}
