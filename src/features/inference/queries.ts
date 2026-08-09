import "server-only"

import { ActionResponse } from "@/shared/types/action-state"
import { mkdir, readdir, readFile } from "fs/promises"
import path from "path"
import { cache } from "react"
import { SYSTEM_PROMPTS_DIR as TEMPLATES_DIR } from "./constants"
import { SystemPromptMeta } from "./types"

export const getSystemPromptsList = cache(
  async (): Promise<SystemPromptMeta[]> => {
    try {
      await mkdir(TEMPLATES_DIR, { recursive: true })
      const filesList = await readdir(TEMPLATES_DIR)
      const templates = filesList
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({ id: file }))
      return templates
    } catch {
      return []
    }
  }
)

export const getSystemPrompt = cache(
  async (promptId: string): ActionResponse<string> => {
    try {
      const template = await readFile(
        path.join(TEMPLATES_DIR, promptId),
        "utf-8"
      )
      return { data: template }
    } catch {
      return { error: "No se pudo cargar la plantilla" }
    }
  }
)
