import "server-only"

import { config } from "@/shared/lib/config"
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises"
import path from "path"
import { cache } from "react"
import { GetPromptsListResult, Prompt } from "../model/prompt-types"

const PROMPTS_DIR = path.join(config.STORAGE_PATH, "prompts")

export const loadPrompt = async (promptId: string): Promise<Prompt> => {
  const systemPrompt = await readFile(path.join(PROMPTS_DIR, promptId), "utf-8")
  return { id: promptId, content: systemPrompt }
}

export const getPromptsList = cache(async (): Promise<GetPromptsListResult> => {
  await mkdir(PROMPTS_DIR, { recursive: true })
  const systemPrompts = await readdir(PROMPTS_DIR)
  const prompts = systemPrompts.filter((file) => file.endsWith(".md"))
  return { promptsIds: prompts }
})

export const savePrompt = async (
  name: string,
  content: string
): Promise<Prompt> => {
  const fileName = name.endsWith(".md") ? name : `${name}.md`
  const filePath = path.join(PROMPTS_DIR, fileName)
  await mkdir(PROMPTS_DIR, { recursive: true })
  await writeFile(filePath, content, "utf-8")
  return { id: fileName, content: content }
}

export const deletePrompt = async (promptId: string): Promise<void> => {
  const filePath = path.join(PROMPTS_DIR, promptId)
  await unlink(filePath)
}
