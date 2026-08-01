import { readdir, readFile, unlink, writeFile } from "fs/promises"
import { revalidatePath } from "next/cache"
import path from "path"
import { join } from "path/posix"
import { ensureDirectoryExists, GENERATED_DIR } from "../lib/chat-utils"
import type {
  SaveChatInput,
  SavedChat,
  SavedChatMeta,
  UpdateChatInput,
} from "../model/types"

/**
 * Lista todas las respuestas ordenadas por fecha de creación descendente.
 */
export async function listChats(): Promise<SavedChatMeta[]> {
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
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Obtiene una respuesta por su ID.
 */

export async function loadChat(id: string): Promise<SavedChat> {
  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(GENERATED_DIR, fileName)
  const savedChat = await readFile(filePath, "utf-8")
  return JSON.parse(savedChat) as SavedChat
} /**
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

/**
 * Elimina un archivo de respuesta por su ID.
 */
export async function deleteChat(id: string): Promise<void> {
  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(GENERATED_DIR, fileName)
  await unlink(filePath)
  revalidatePath("/chat")
}
