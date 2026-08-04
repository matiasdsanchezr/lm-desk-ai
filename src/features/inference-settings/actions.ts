"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { mkdir, unlink, writeFile } from "fs/promises"
import { revalidatePath } from "next/cache"
import path from "path"
import { PROMPTS_DIR } from "./constants"
import { Prompt } from "./types"

export const savePrompt = async (
  name: string,
  content: string
): ActionResponse<Prompt> => {
  try {
    const fileName = name.endsWith(".md") ? name : `${name}.md`
    const filePath = path.join(PROMPTS_DIR, fileName)

    await mkdir(PROMPTS_DIR, { recursive: true })
    await writeFile(filePath, content, "utf-8")

    revalidatePath("/")
    return { data: { id: fileName, content } }
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
