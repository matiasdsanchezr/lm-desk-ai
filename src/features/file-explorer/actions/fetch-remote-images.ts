"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { ImageFile } from "@/shared/types/image-file"
import { z } from "zod"
import { fetchRemoteImageAsBase64 } from "../utils"

const remoteImagesSchema = z.object({
  urls: z
    .array(z.url("Formato de URL inválido"))
    .max(10, "Máximo 10 imágenes a la vez"),
})

export interface FetchRemoteImagesResult {
  images: ImageFile[]
  failedUrls: string[]
}

export async function fetchRemoteImagesAction(
  rawUrls: string[]
): ActionResponse<FetchRemoteImagesResult> {
  const filteredUrls = rawUrls.map((u) => u.trim()).filter(Boolean)
  const validation = remoteImagesSchema.safeParse({ urls: filteredUrls })

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message ?? "URLs inválidas",
    }
  }

  const successfulImages: ImageFile[] = []
  const failedUrls: string[] = []

  await Promise.allSettled(
    validation.data.urls.map(async (url) => {
      try {
        const image = await fetchRemoteImageAsBase64(url)
        successfulImages.push(image)
      } catch (err) {
        console.error(`[fetchRemoteImagesAction] Error al cargar ${url}:`, err)
        failedUrls.push(url)
      }
    })
  )

  if (successfulImages.length === 0 && failedUrls.length > 0) {
    return {
      error: "No se pudo descargar ninguna de las imágenes proporcionadas.",
      data: { images: [], failedUrls },
    }
  }

  return {
    data: {
      images: successfulImages,
      failedUrls,
    },
  }
}
