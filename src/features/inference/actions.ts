"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { mkdir, unlink, writeFile } from "fs/promises"
import { revalidatePath, updateTag } from "next/cache"
import path from "path"
import { SYSTEM_PROMPTS_DIR } from "./constants"
import * as inferenceQueries from "./queries"
import { SystemPromptTemplate } from "./types"

export const saveSystemPrompt = async (
  name: string,
  content: string
): ActionResponse<SystemPromptTemplate> => {
  try {
    const fileName = name.endsWith(".md") ? name : `${name}.md`
    const filePath = path.join(SYSTEM_PROMPTS_DIR, fileName)

    await mkdir(SYSTEM_PROMPTS_DIR, { recursive: true })
    await writeFile(filePath, content, "utf-8")

    updateTag("system-prompts-list")
    updateTag(`system-prompt-${fileName}`)
    revalidatePath("/")

    return { data: { id: fileName, content } }
  } catch {
    return { error: "No se pudo guardar la plantilla" }
  }
}

export const deleteSystemPrompt = async (promptId: string): ActionResponse => {
  try {
    const filePath = path.join(SYSTEM_PROMPTS_DIR, promptId)
    await unlink(filePath)

    updateTag("system-prompts-list")
    updateTag(`system-prompt-${promptId}`)
    revalidatePath("/")

    return { data: undefined }
  } catch {
    return { error: "No se pudo eliminar la plantilla" }
  }
}

export const getSystemPrompt = async (
  promptId: string
): Promise<ActionResponse<string>> => {
  return inferenceQueries.getSystemPrompt(promptId)
}

export async function refreshSystemPromptsList(): Promise<void> {
  updateTag("system-prompts-list")
}
