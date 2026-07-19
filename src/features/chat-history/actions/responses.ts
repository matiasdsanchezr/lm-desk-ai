"use server"

import { revalidatePath } from "next/cache"
import {
  chatHistoryService,
  SavedResponseMeta,
  type SavedResponse,
} from "../services/chat-history-service"

export const saveResponse = async (data: {
  title?: string
  selectedFiles: string[]
  userPrompt: string
  response: string
}) => {
  try {
    const result = await chatHistoryService.saveResponse(data)
    revalidatePath("/chat")
    return { success: true, id: result.id }
  } catch (error) {
    console.error("Error al guardar la respuesta:", error)
    throw new Error("No se pudo guardar la respuesta generada")
  }
}

export const loadResponse = async (id: string): Promise<SavedResponse> => {
  try {
    return await chatHistoryService.loadResponse(id)
  } catch (error) {
    console.error(`Error al cargar la respuesta ${id}:`, error)
    throw new Error("No se pudo cargar la respuesta especificada")
  }
}

export const listResponses = async (): Promise<SavedResponseMeta[]> => {
  try {
    return await chatHistoryService.listResponses()
  } catch (error) {
    console.error("Error al listar las respuestas:", error)
    return []
  }
}

export const deleteResponse = async (id: string) => {
  try {
    await chatHistoryService.deleteResponse(id)
    revalidatePath("/chat")
    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar la respuesta ${id}:`, error)
    throw new Error("No se pudo eliminar la respuesta")
  }
}
