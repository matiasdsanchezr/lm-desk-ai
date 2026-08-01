import { config } from "@/shared/lib/config"
import { revalidatePath } from "next/cache"
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  SaveChatInput,
  SavedChat,
  SavedChatMeta,
  UpdateChatInput,
} from "../model/types"

export const chatHistoryService = {

  

  /**
   * Lista todas las respuestas ordenadas por fecha de creación descendente.
   */
  async listChats(): Promise<SavedChatMeta[]> {
    await ensureDirectoryExists()
    const files = await readdir(GENERATED_DIR)
    const jsonFiles = files.filter((file) => file.endsWith(".json"))
    const chatsData = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(GENERATED_DIR, file)
          const content = await readFile(filePath, "utf-8")
          const savedChat = JSON.parse(content) as SavedChat
          return {
            id: savedChat.id,
            title: savedChat.title,
            createdAt: savedChat.createdAt,
          } satisfies SavedChatMeta
        } catch (err) {
          console.error(`Error leyendo el archivo de respuesta ${file}:`, err)
          return null
        }
      })
    )

    const validChats = chatsData.filter(
      (chat): chat is SavedChatMeta => chat !== null
    )

    return validChats.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  /**
   * Elimina un archivo de respuesta por su ID.
   */
  async deleteChat(id: string): Promise<void> {
    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(GENERATED_DIR, fileName)
    await unlink(filePath)
    revalidatePath("/chat")
  },
}
