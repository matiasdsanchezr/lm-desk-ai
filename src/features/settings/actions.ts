"use server"

import { config } from "@/shared/lib/config"
import { ActionResponse } from "@/shared/types/action-state"
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises"
import { revalidatePath } from "next/cache"
import path from "path"
import { cache } from "react"

const PROMPTS_DIR = path.join(config.STORAGE_PATH, "prompts")

export const loadPrompt = async (promptId: string): ActionResponse<string> => {
  try {
    const systemPrompt = await readFile(
      path.join(PROMPTS_DIR, promptId),
      "utf-8"
    )
    return { data: systemPrompt }
  } catch (error) {
    return { error: "No se pudo cargar la plantilla" }
  }
}

export const loadPrompts = cache(async (): ActionResponse<string[]> => {
  try {
    await mkdir(PROMPTS_DIR, { recursive: true })
    const systemPrompts = await readdir(PROMPTS_DIR)
    const prompts = systemPrompts.filter((file) => file.endsWith(".md"))
    return { data: prompts }
  } catch (error) {
    return { error: "No se pudieron obtener las plantillas" }
  }
})

export const savePrompt = async (
  name: string,
  content: string
): ActionResponse<{ fileName: string }> => {
  try {
    const fileName = name.endsWith(".md") ? name : `${name}.md`
    const filePath = path.join(PROMPTS_DIR, fileName)

    await mkdir(PROMPTS_DIR, { recursive: true })
    await writeFile(filePath, content, "utf-8")

    revalidatePath("/")
    return { data: { fileName } }
  } catch (error) {
    return { error: "No se pudo guardar la plantilla" }
  }
}

export const deletePrompt = async (promptId: string): ActionResponse => {
  try {
    const filePath = path.join(PROMPTS_DIR, promptId)
    await unlink(filePath)

    revalidatePath("/")
    return { data: undefined }
  } catch (error) {
    return { error: "No se pudo eliminar la plantilla" }
  }
}
