import "server-only"

import { ActionResponse } from "@/shared/types/action-state"
import { mkdir, readdir, readFile } from "fs/promises"
import { cacheLife, cacheTag } from "next/cache"
import path from "path"
import { SYSTEM_PROMPTS_DIR as TEMPLATES_DIR } from "./constants"
import { SystemPromptMeta } from "./types"

export async function getSystemPromptsList(): Promise<SystemPromptMeta[]> {
  "use cache"
  cacheTag("system-prompts-list")
  cacheLife("days")

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

export async function getSystemPrompt(
  promptId: string
): Promise<ActionResponse<string>> {
  // "use cache"
  // cacheTag(`system-prompt-${promptId}`)
  // cacheLife("days")

  try {
    const template = await readFile(path.join(TEMPLATES_DIR, promptId), "utf-8")
    return { data: template }
  } catch {
    return { error: "No se pudo cargar la plantilla" }
  }
}
