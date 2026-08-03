import "server-only"

import { config } from "@/shared/lib/config"
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises"
import { revalidatePath } from "next/cache"
import path from "path"
import type {
  SaveChatInput,
  SavedChat,
  SavedChatMeta,
  UpdateChatInput,
} from "../types"

const GENERATED_DIR = path.join(config.STORAGE_PATH, "chats")

/**
 * Asegura que el directorio para guardar los chats exista.
 */
async function ensureDirectoryExists(): Promise<void> {
  await mkdir(GENERATED_DIR, { recursive: true })
}

/**
 * Guarda una nueva conversación o sobrescribe una existente.
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

  const filePath = path.join(GENERATED_DIR, `${id}.json`)
  await writeFile(filePath, JSON.stringify(newChat, null, 2), "utf-8")

  revalidatePath("/chat")
  return newChat
}

/**
 * Carga una conversación por su ID.
 */
export async function loadChat(id: string): Promise<SavedChat> {
  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(GENERATED_DIR, fileName)
  const savedChat = await readFile(filePath, "utf-8")
  return JSON.parse(savedChat) as SavedChat
}

/**
 * Actualiza parcialmente una conversación existente.
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
 * Lista todas las conversaciones ordenadas por fecha de creación descendente.
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
 * Elimina una conversación usando su ID.
 */
export async function deleteChat(id: string): Promise<void> {
  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(GENERATED_DIR, fileName)
  await unlink(filePath)
  revalidatePath("/chat")
}
