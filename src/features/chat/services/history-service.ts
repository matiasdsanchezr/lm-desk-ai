import "server-only"

import { config } from "@/shared/lib/config"
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises"
import path from "path"
import type { Chat, ChatMeta, CreateChatInput, UpdateChatInput } from "../types"

const CHATS_STORAGE_DIR = path.join(config.STORAGE_PATH, "chats")

/**
 * Asegura que el directorio para guardar los chats exista.
 */
async function ensureDirectoryExists(): Promise<void> {
  await mkdir(CHATS_STORAGE_DIR, { recursive: true })
}

/**
 * Guarda una nueva conversación o sobrescribe una existente.
 */
export async function createChat(data: CreateChatInput): Promise<Chat> {
  await ensureDirectoryExists()

  const id = data.id || `session-${Date.now()}`
  const title = data.title || "Sesión sin título"
  const createdAt = new Date().toISOString()
  const newChat: Chat = {
    id,
    title,
    createdAt,
    messages: data.messages,
    activeStreamId: data.activeStreamId,
  }
  const filePath = path.join(CHATS_STORAGE_DIR, `${id}.json`)
  await writeFile(filePath, JSON.stringify(newChat, null, 2), "utf-8")
  return newChat
}

/**
 * Carga una conversación por su ID.
 */
export async function getChatById(id: string): Promise<Chat | null> {
  try {
    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(CHATS_STORAGE_DIR, fileName)
    const savedChat = await readFile(filePath, "utf-8")
    return JSON.parse(savedChat) as Chat
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      if ((error as { code: string }).code === "ENOENT") {
        return null
      }
    }
    throw error
  }
}

/**
 * Actualiza parcialmente una conversación existente.
 */
export async function updateChat(
  id: string,
  data: UpdateChatInput
): Promise<Chat> {
  try {
    const savedChat = await getChatById(id)
    if (!savedChat) {
      throw new Error("Chat no encontrado")
    }

    const updatedChat: Chat = {
      ...savedChat,
      ...data,
    }

    const fileName = id.endsWith(".json") ? id : `${id}.json`
    const filePath = path.join(CHATS_STORAGE_DIR, fileName)
    await writeFile(filePath, JSON.stringify(updatedChat, null, 2), "utf-8")
    return updatedChat
  } catch (error) {
    throw error
  }
}

/**
 * Lista todas las conversaciones ordenadas por fecha de creación descendente.
 */
export async function listChats(): Promise<ChatMeta[]> {
  await ensureDirectoryExists()
  const files = await readdir(CHATS_STORAGE_DIR)
  const jsonFiles = files.filter((file) => file.endsWith(".json"))

  const chatsData = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const filePath = path.join(CHATS_STORAGE_DIR, file)
        const content = await readFile(filePath, "utf-8")
        const savedChat = JSON.parse(content) as Chat
        return {
          id: savedChat.id,
          title: savedChat.title,
          createdAt: savedChat.createdAt,
        } satisfies ChatMeta
      } catch (err) {
        console.error("Error al listar sesiones previas", err)
        return null
      }
    })
  )

  const validChats = chatsData.filter((chat): chat is ChatMeta => chat !== null)

  return validChats.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Elimina una conversación usando su ID.
 */
export async function deleteChat(id: string): Promise<void> {
  const fileName = id.endsWith(".json") ? id : `${id}.json`
  const filePath = path.join(CHATS_STORAGE_DIR, fileName)
  await unlink(filePath)
}
