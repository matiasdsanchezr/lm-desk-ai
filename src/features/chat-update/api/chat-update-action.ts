"use server"
import { updateChat, type UpdateChatInput } from "@/entities/chat"
import type { ActionState } from "@/shared/types/action-state"
import { revalidatePath } from "next/cache"

export const chatUpdateAction = async (
  id: string,
  updates: UpdateChatInput
): Promise<ActionState<void>> => {
  try {
    await updateChat(id, updates)
    revalidatePath("/chat")
    return {}
  } catch (error) {
    console.error(`Error al actualizar el chat ${id}:`, error)
    return { error: "No se pudo actualizar el chat" }
  }
}
