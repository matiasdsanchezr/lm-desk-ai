import "server-only"

import { mkdir, readdir } from "fs/promises"
import { cache } from "react"
import { PROMPTS_DIR } from "../constants"
import { PromptMeta } from "../types"

export const getPromptList = cache(async (): Promise<PromptMeta[]> => {
  try {
    await mkdir(PROMPTS_DIR, { recursive: true })
    const systemPrompts = await readdir(PROMPTS_DIR)
    const prompts = systemPrompts
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({ id: file }))
    return prompts
  } catch (error) {
    return []
  }
})
