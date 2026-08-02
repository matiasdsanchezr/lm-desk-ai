"use server"
import { Prompt } from "@/entities/prompt"
import { loadPrompt } from "@/entities/prompt/index.server"
import { ActionState } from "@/shared/types/action-state"

export const promptSelectAction = async (
  promptId: string
): Promise<ActionState<Prompt>> => {
  if (!promptId) return { error: "No se especifico un id" }

  try {
    const result = await loadPrompt(promptId)
    return { data: result }
  } catch {
    return { error: "No se pudo cargar el prompt especificado" }
  }
}
