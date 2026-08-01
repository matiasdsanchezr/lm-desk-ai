import { writeFile } from "fs/promises"
import { revalidatePath } from "next/cache"
import path from "path"
import { GENERATED_DIR } from "../lib/chat-utils"
import type { SavedChat, UpdateChatInput } from "../model/types"
import { loadChat } from "./load-chat"

/**
 * Actualiza campos específicos de una respuesta existente por su ID.
 */
export async function updateChat(
  id: string,
  updates: UpdateChatInput
): Promise<SavedChat> {
  const savedChat = await loadChat(id)

  const updatedChat: SavedChat = {
    ...savedChat,
    ...updates,
  }

  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(GENERATED_DIR, fileName)
  await writeFile(filePath, JSON.stringify(updatedChat, null, 2), "utf-8")

  revalidatePath(`/chat/${id}`)
  return updatedChat
}
