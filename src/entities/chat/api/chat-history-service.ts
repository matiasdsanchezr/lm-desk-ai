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

const GENERATED_DIR = path.join(config.STORAGE_PATH, "chats")

async function ensureDirectoryExists() {
  await mkdir(GENERATED_DIR, { recursive: true })
}

export const chatHistoryService = {
  /**
   * Guarda una respuesta en el sistema de archivos local.
   */
  async saveChat(data: SaveChatInput): Promise<SavedChat> {
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

    const filePath = path.join(GENERATED_DIR, `${id}.json`)
    await writeFile(filePath, JSON.stringify(newChat, null, 2), "utf-8")

    revalidatePath("/chat")
    return newChat
  },

  /**
   * Obtiene una respuesta por su ID.
   */
  async loadChat(id: string): Promise<SavedChat> {
    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(GENERATED_DIR, fileName)
    const savedChat = await readFile(filePath, "utf-8")
    return JSON.parse(savedChat) as SavedChat
  },

  /**
   * Actualiza campos específicos de una respuesta existente por su ID.
   */
  async updateChat(id: string, updates: UpdateChatInput): Promise<SavedChat> {
    const savedChat = await chatHistoryService.loadChat(id)

    const updatedChat: SavedChat = {
      ...savedChat,
      ...updates,
    }

    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(GENERATED_DIR, fileName)
    await writeFile(filePath, JSON.stringify(updatedChat, null, 2), "utf-8")

    revalidatePath(`/chat/${id}`)
    return updatedChat
  },

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
