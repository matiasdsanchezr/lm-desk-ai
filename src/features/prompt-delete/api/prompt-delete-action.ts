"use server"
import { deletePrompt } from "@/entities/prompt/index.server"
import { ActionState } from "@/shared/types/action-state"

export const promptDeleteAction = async (
  promptId: string
): Promise<ActionState<void>> => {
  try {
    await deletePrompt(promptId)
    return { data: undefined }
  } catch (error) {
    console.error("Error al eliminar la plantilla:", error)
    return { error: "No se pudo eliminar la plantilla" }
  }
}
