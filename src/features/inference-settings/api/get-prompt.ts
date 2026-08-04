import "server-only"

import { ActionResponse } from "@/shared/types/action-state"
import { readFile } from "fs/promises"
import path from "path"
import { cache } from "react"
import { PROMPTS_DIR } from "../constants"

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
