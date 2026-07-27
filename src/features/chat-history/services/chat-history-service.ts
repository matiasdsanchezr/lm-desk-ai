import { config } from "@/lib/config"
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  SaveChatInput,
  SavedChat,
  SavedChatMeta,
  UpdateChatInput,
} from "../types/saved-chat"

const GENERATED_DIR = path.join(config.STORAGE_PATH, "chats")

async function ensureDirectoryExists() {
  await mkdir(GENERATED_DIR, { recursive: true })
}

export const chatHistoryService = {
  /**
   * Guarda una respuesta en el sistema de archivos local.
   */
  async saveResponse(data: SaveChatInput): Promise<SavedChat> {
    await ensureDirectoryExists()

    const id = `response-${Date.now()}`
    const title = data.title ?? id
    const createdAt = new Date().toISOString()

    const payload: SavedChat = {
      id,
      title,
      createdAt,
      selectedFiles: data.selectedFiles,
      messages: data.messages,
    }

    const filePath = path.join(GENERATED_DIR, `${id}.json`)
    await writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8")

    return payload
  },

  /**
   * Obtiene una respuesta por su ID.
   */
  async loadResponse(id: string): Promise<SavedChat> {
    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(GENERATED_DIR, fileName)
    const content = await readFile(filePath, "utf-8")
    return JSON.parse(content) as SavedChat
  },

  /**
   * Actualiza campos específicos de una respuesta existente por su ID.
   */
  async updateResponse(
    id: string,
    updates: UpdateChatInput
  ): Promise<SavedChat> {
    const currentResponse = await chatHistoryService.loadResponse(id)

    const updatedResponse: SavedChat = {
      ...currentResponse,
      ...updates,
    }

    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(GENERATED_DIR, fileName)
    await writeFile(filePath, JSON.stringify(updatedResponse, null, 2), "utf-8")

    return updatedResponse
  },

  /**
   * Lista todas las respuestas ordenadas por fecha de creación descendente.
   */
  async listResponses(): Promise<SavedChatMeta[]> {
    await ensureDirectoryExists()
    const files = await readdir(GENERATED_DIR)
    const jsonFiles = files.filter((file) => file.endsWith(".json"))

    const responses: SavedChatMeta[] = []
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(GENERATED_DIR, file)
        const content = await readFile(filePath, "utf-8")
        const fullData = JSON.parse(content) as SavedChat

        responses.push({
          id: fullData.id,
          title: fullData.title,
          createdAt: fullData.createdAt,
        })
      } catch (err) {
        console.error(`Error leyendo el archivo de respuesta ${file}:`, err)
      }
    }

    return responses.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  /**
   * Elimina un archivo de respuesta por su ID.
   */
  async deleteResponse(id: string): Promise<void> {
    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(GENERATED_DIR, fileName)
    await unlink(filePath)
  },
}
