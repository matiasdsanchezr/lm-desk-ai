import { writeFile } from "fs/promises"
import { revalidatePath } from "next/cache"
import { join } from "path"
import { ensureDirectoryExists, GENERATED_DIR } from "../lib/chat-utils"
import type { SaveChatInput, SavedChat } from "../model/types"

/**
 * Guarda una respuesta en el sistema de archivos local.
 */
export async function saveChat(data: SaveChatInput): Promise<SavedChat> {
  await ensureDirectoryExists()

  const id = data.id ?? `session-${Date.now()}`
  const title = data.title ?? id
  const createdAt = new Date().toISOString()

  const newChat: SavedChat = {
    id,
    title,
    createdAt,
    selectedFiles: data.selectedFiles,
    messages: data.messages,
  }

  const filePath = join(GENERATED_DIR, `${id}.json`)
  await writeFile(filePath, JSON.stringify(newChat, null, 2), "utf-8")

  revalidatePath("/chat")
  return newChat
}
