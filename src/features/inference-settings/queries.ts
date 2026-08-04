import "server-only"

import { ActionResponse } from "@/shared/types/action-state"
import { mkdir, readdir, readFile } from "fs/promises"
import path from "path"
import { cache } from "react"
import { PROMPTS_DIR } from "./constants"
import { PromptMeta } from "./types"

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

export const getPrompt = cache(
  async (promptId: string): ActionResponse<string> => {
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
)
