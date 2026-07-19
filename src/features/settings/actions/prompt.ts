"use server"

import { config } from "@/lib/config"
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

export const savePrompt = async (name: string, content: string) => {
  const fileName = name.endsWith(".md") ? name : `${name}.md`
  const filePath = path.join(PROMPTS_DIR, fileName)

  await mkdir(PROMPTS_DIR, { recursive: true })
  await writeFile(filePath, content, "utf-8")

  revalidatePath("/")

  return { success: true, fileName }
}

export const deletePrompt = async (promptId: string) => {
  const filePath = path.join(PROMPTS_DIR, promptId)
  await unlink(filePath)

  revalidatePath("/")

  return { success: true }
}
