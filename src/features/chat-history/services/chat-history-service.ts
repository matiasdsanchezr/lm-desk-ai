// src/features/chat-history/services/chat-history-service.ts
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type {
  SaveChatInput,
  SavedChat,
  SavedChatMeta,
  UpdateChatInput,
} from "../types/saved-chat"

export const chatHistoryService = {
  /**
   * Guarda o crea una nueva respuesta/chat en la base de datos.
   */
  async saveChat(data: SaveChatInput): Promise<SavedChat> {
    const title = data.title ?? `response-${Date.now()}`

    const record = await prisma.chat.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        title,
        selectedFiles: data.selectedFiles,
        messages: data.messages as unknown as Prisma.InputJsonValue,
      },
    })

    return {
      id: record.id,
      title: record.title,
      createdAt: record.createdAt.toISOString(),
      selectedFiles: record.selectedFiles,
      messages: record.messages as unknown as SavedChat["messages"],
    }
  },

  /**
   * Obtiene un chat por su ID.
   */
  async loadChat(id: string): Promise<SavedChat> {
    // Eliminar la extensión .json si viniera en un ID antiguo
    const cleanId = id.replace(/\.json$/, "")
    const record = await prisma.chat.findUnique({
      where: { id: cleanId },
    })

    if (!record) {
      throw new Error(`Chat con ID ${id} no encontrado`)
    }

    return {
      id: record.id,
      title: record.title,
      createdAt: record.createdAt.toISOString(),
      selectedFiles: record.selectedFiles,
      messages: record.messages as unknown as SavedChat["messages"],
    }
  },

  /**
   * Actualiza campos específicos de un chat existente.
   */
  async updateChat(id: string, updates: UpdateChatInput): Promise<SavedChat> {
    const cleanId = id.replace(/\.json$/, "")

    const record = await prisma.chat.update({
      where: { id: cleanId },
      data: {
        ...(updates.title !== undefined ? { title: updates.title } : {}),
        ...(updates.selectedFiles !== undefined
          ? { selectedFiles: updates.selectedFiles }
          : {}),
        ...(updates.messages !== undefined
          ? { messages: updates.messages as unknown as Prisma.InputJsonValue }
          : {}),
      },
    })

    return {
      id: record.id,
      title: record.title,
      createdAt: record.createdAt.toISOString(),
      selectedFiles: record.selectedFiles,
      messages: record.messages as unknown as SavedChat["messages"],
    }
  },

  /**
   * Lista todos los chats ordenados por fecha de creación descendente.
   */
  async listChats(): Promise<SavedChatMeta[]> {
    const records = await prisma.chat.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      createdAt: record.createdAt.toISOString(),
    }))
  },

  /**
   * Elimina un chat por su ID.
   */
  async deleteChat(id: string): Promise<void> {
    const cleanId = id.replace(/\.json$/, "")
    await prisma.chat.delete({
      where: { id: cleanId },
    })
  },
}
