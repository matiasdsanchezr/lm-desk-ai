import { readFile } from "fs/promises"
import path from "path"
import { GENERATED_DIR } from "../lib/chat-utils"
import type { SavedChat } from "../model/types"

/**
 * Obtiene una respuesta por su ID.
 */
export async function loadChat(id: string): Promise<SavedChat> {
  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(GENERATED_DIR, fileName)
  const savedChat = await readFile(filePath, "utf-8")
  return JSON.parse(savedChat) as SavedChat
}
