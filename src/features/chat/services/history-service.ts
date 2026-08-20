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
  const filePath = getChatFilePath(id)
  await writeFile(filePath, JSON.stringify(newChat, null, 2), "utf-8")
  return newChat
}

export async function getChatById(id: string): Promise<Chat | null> {
  try {
    const filePath = getChatFilePath(id)
    const savedChat = await readFile(filePath, "utf-8")
    return JSON.parse(savedChat) as Chat
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      if ((error as { code: string }).code === "ENOENT") {
        return null
      }
    }
    throw new Error("No se pudo obtener la conversación")
  }
}

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

    const filePath = getChatFilePath(id)
    await writeFile(filePath, JSON.stringify(updatedChat, null, 2), "utf-8")
    return updatedChat
  } catch {
    throw new Error("No se pudo actualizar la conversación")
  }
}

export async function listChats(): Promise<ChatMeta[]> {
  await ensureDirectoryExists()
  const files = await readdir(CHATS_STORAGE_DIR)
  const jsonFiles = files.filter((file) => file.endsWith(".json"))

  const chatsData = await Promise.all(
    jsonFiles.map(async (file) => {
      try {
        const filePath = getChatFilePath(file)
        const content = await readFile(filePath, "utf-8")
        const savedChat = JSON.parse(content) as Chat
        return {
          id: savedChat.id,
          title: savedChat.title,
          createdAt: savedChat.createdAt,
        } satisfies ChatMeta
      } catch {
        throw new Error("No se pudo obtener las conversaciones")
      }
    })
  )

  const validChats = chatsData.filter((chat): chat is ChatMeta => chat !== null)

  return validChats.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function deleteChat(id: string): Promise<void> {
  const filePath = getChatFilePath(id)
  await unlink(filePath)
}
