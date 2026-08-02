"use server"
import { type SaveChatInput, SavedChat, saveChat } from "@/entities/chat"
import { ActionState } from "@/shared/types/action-state"
import { revalidatePath } from "next/cache"

export const chatCreateAction = async (
  data: SaveChatInput
): Promise<ActionState<SavedChat>> => {
  try {
    const newChat = await saveChat(data)
    revalidatePath("/chat")
    return { data: newChat }
  } catch (error) {
    console.error("Error al guardar el chat:", error)
    return { error: "No se pudo guardar el chat" }
  }
}
