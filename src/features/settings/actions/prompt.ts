"use server"

import { config } from "@/lib/config"
import { ActionState } from "@/types/action-state"
import { readdir, readFile, unlink, writeFile, mkdir } from "fs/promises"
import { revalidatePath } from "next/cache"
import path from "path"

const PROMPTS_DIR = path.join(config.STORAGE_PATH, "prompts")

export const loadPrompt = async (promptId: string) => {
  const systemPrompt = await readFile(path.join(PROMPTS_DIR, promptId), "utf-8")
  return systemPrompt
}

export const loadPrompts = async () => {
  try {
    await mkdir(PROMPTS_DIR, { recursive: true })
    const systemPrompts = await readdir(PROMPTS_DIR)
    return systemPrompts.filter((file) => file.endsWith(".md"))
  } catch (error) {
    console.error("Error leyendo directorio de prompts:", error)
    return []
  }
}

export const savePrompt = async (
  name: string,
  content: string
): Promise<ActionState<{ fileName: string }>> => {
  try {
    const fileName = name.endsWith(".md") ? name : `${name}.md`
    const filePath = path.join(PROMPTS_DIR, fileName)

    await mkdir(PROMPTS_DIR, { recursive: true })
    await writeFile(filePath, content, "utf-8")

    revalidatePath("/")
    return { data: { fileName } }
  } catch (error) {
    console.error("Error al guardar la plantilla:", error)
    return { error: "No se pudo guardar la plantilla" }
  }
}

export const deletePrompt = async (
  promptId: string
): Promise<ActionState<void>> => {
  try {
    const filePath = path.join(PROMPTS_DIR, promptId)
    await unlink(filePath)

    revalidatePath("/")
    return { data: undefined }
  } catch (error) {
    console.error("Error al eliminar la plantilla:", error)
    return { error: "No se pudo eliminar la plantilla" }
  }
}
