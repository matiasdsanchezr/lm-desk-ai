"use server"

import { ActionState } from "@/types/action-state"
import { revalidatePath } from "next/cache"
import {
  chatHistoryService,
  SavedResponseMeta,
  type SavedResponse,
} from "../services/chat-history-service"

export const saveChat = async (data: {
  title?: string
  selectedFiles: string[]
  userPrompt: string
  response: string
}): Promise<ActionState<{ id: string }>> => {
  try {
    const result = await chatHistoryService.saveResponse(data)
    revalidatePath("/chat")
    return { data: { id: result.id } }
  } catch (error) {
    console.error("Error al guardar la respuesta:", error)
    return { error: "No se pudo guardar la respuesta generada" }
  }
}

export const loadChat = async (
  id: string
): Promise<ActionState<SavedResponse>> => {
  try {
    const result = await chatHistoryService.loadResponse(id)
    return { data: result }
  } catch {
    return { error: "No se pudo cargar la respuesta especificada" }
  }
}

export const listChats = async (): Promise<
  ActionState<SavedResponseMeta[]>
> => {
  try {
    const result = await chatHistoryService.listResponses()
    return { data: result }
  } catch (error) {
    console.error("Error al listar las respuestas:", error)
    return { error: "No se pudieron listar las respuestas" }
  }
}

export const deleteChat = async (id: string): Promise<ActionState<void>> => {
  try {
    await chatHistoryService.deleteResponse(id)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    console.error(`Error al eliminar la respuesta ${id}:`, error)
    return { error: "No se pudo eliminar la respuesta" }
  }
}
