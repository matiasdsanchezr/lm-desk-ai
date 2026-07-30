"use server"

import { prisma } from "@/lib/prisma"
import { ActionState } from "@/types/action-state"
import { revalidatePath } from "next/cache"

export const loadPrompt = async (promptId: string): Promise<string> => {
  try {
    const prompt = await prisma.systemPrompt.findUnique({
      where: { id: promptId },
    })
    return prompt?.content ?? ""
  } catch (error) {
    console.error("Error cargando plantilla:", error)
    return ""
  }
}

export const loadPrompts = async (): Promise<
  { id: string; name: string }[]
> => {
  try {
    const prompts = await prisma.systemPrompt.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })
    return prompts
  } catch (error) {
    console.error("Error leyendo plantillas desde la base de datos:", error)
    return []
  }
}

export const savePrompt = async (
  name: string,
  content: string
): Promise<ActionState<{ id: string; name: string }>> => {
  try {
    const cleanName = name.trim()

    const prompt = await prisma.systemPrompt.upsert({
      where: { name: cleanName },
      update: { content },
      create: { name: cleanName, content },
    })

    revalidatePath("/")
    return { data: { id: prompt.id, name: prompt.name } }
  } catch (error) {
    console.error("Error al guardar la plantilla:", error)
    return { error: "No se pudo guardar la plantilla" }
  }
}

export const deletePrompt = async (
  promptId: string
): Promise<ActionState<void>> => {
  try {
    await prisma.systemPrompt.delete({
      where: { id: promptId },
    })

    revalidatePath("/")
    return { data: undefined }
  } catch (error) {
    console.error("Error al eliminar la plantilla:", error)
    return { error: "No se pudo eliminar la plantilla" }
  }
}
