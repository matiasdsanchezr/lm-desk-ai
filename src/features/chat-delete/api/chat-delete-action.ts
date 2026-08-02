"use server"
import { deleteChat } from "@/entities/chat"
import { ActionState } from "@/shared/types/action-state"
import { revalidatePath } from "next/cache"

export const chatDeleteAction = async (
  id: string
): Promise<ActionState<void>> => {
  try {
    await deleteChat(id)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    console.error(`Error al eliminar el chat ${id}:`, error)
    return { error: "No se pudo eliminar el chat" }
  }
}
