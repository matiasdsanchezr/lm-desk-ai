import "server-only"

import { config } from "@/shared/lib/config"
import { mkdir, readdir, readFile, unlink, writeFile } from "fs/promises"
import path from "path"
import type { Chat, ChatMeta, CreateChatInput, UpdateChatInput } from "../types"

const CHATS_STORAGE_DIR = path.join(config.STORAGE_PATH, "chats")

function getChatFilePath(id: string): string {
  return path.join(CHATS_STORAGE_DIR, id.endsWith(".json") ? id : `${id}.json`)
}

async function ensureDirectoryExists(): Promise<void> {
  await mkdir(CHATS_STORAGE_DIR, { recursive: true })
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function createChat(data: CreateChatInput): Promise<Chat> {
  await ensureDirectoryExists()

  const newChat: Chat = {
    id: data.id || `session-${Date.now()}`,
    title: data.title || "Sesión sin título",
    createdAt: new Date().toISOString(),
    messages: data.messages,
    selectedFilePaths: data.selectedFilePaths,
    activeStreamId: data.activeStreamId,
  }

  await writeFile(
    getChatFilePath(newChat.id),
    JSON.stringify(newChat, null, 2),
    "utf-8"
  )
  return newChat
}

export async function getChatById(id: string): Promise<Chat | null> {
  if (!id) return null
  return await readJsonFile<Chat>(getChatFilePath(id))
}

export async function updateChat(
  id: string,
  data: UpdateChatInput
): Promise<Chat> {
  const savedChat = await getChatById(id)
  if (!savedChat) throw new Error("Chat no encontrado")

  const updatedChat: Chat = { ...savedChat, ...data }
  await writeFile(
    getChatFilePath(id),
    JSON.stringify(updatedChat, null, 2),
    "utf-8"
  )
  return updatedChat
}

export async function duplicateChat(id: string): Promise<Chat> {
  const originalChat = await getChatById(id)
  if (!originalChat) {
    throw new Error("Conversación no encontrada para duplicar")
  }

  const baseTitle = originalChat.title?.trim() || "Sesión sin título"
  return await createChat({
    title: `${baseTitle} (Copia)`,
    messages: originalChat.messages ?? [],
    selectedFilePaths: originalChat.selectedFilePaths ?? [],
  })
}

export async function listChats(): Promise<ChatMeta[]> {
  await ensureDirectoryExists()
  const files = await readdir(CHATS_STORAGE_DIR)
  const jsonFiles = files.filter((f) => f.endsWith(".json"))
  const chats = await Promise.all(
    jsonFiles.map(async (file) => {
      const data = await readJsonFile<Chat>(getChatFilePath(file))
      if (!data) return null
      return {
        id: data.id,
        title: data.title,
        createdAt: data.createdAt,
      } satisfies ChatMeta
    })
  )

  return chats
    .filter((c): c is ChatMeta => c !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export async function deleteChat(id: string): Promise<void> {
  await unlink(getChatFilePath(id)).catch(() => {})
}
