"use server"
import { Prompt } from "@/entities/prompt"
import { savePrompt } from "@/entities/prompt/index.server"
import { ActionState } from "@/shared/types/action-state"

export const promptCreateAction = async (
  name: string,
  content: string
): Promise<ActionState<Prompt>> => {
  try {
    const result = await savePrompt(name, content)
    return { data: result }
  } catch (error) {
    console.error("Error al guardar la plantilla:", error)
    return { error: "No se pudo guardar la plantilla" }
  }
}
