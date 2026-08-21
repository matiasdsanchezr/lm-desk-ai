"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { ImageFile } from "@/shared/types/image-file"
import { z } from "zod"

const remoteImagesSchema = z.object({
  urls: z
    .array(z.url("Formato de URL inválido"))
    .max(10, "Máximo 10 imágenes a la vez"),
})

export interface FetchRemoteImagesResult {
  images: ImageFile[]
  failedUrls: string[]
}

async function fetchRemoteImageAsBase64(src: string): Promise<ImageFile> {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Error al cargar la imagen con URL: ${src}`)
  }

  const mime = response.headers.get("content-type")
  if (!mime || !mime.startsWith("image/")) {
    throw new Error(`Error al cargar la imagen, MIME inválido. URL: ${src}`)
  }

  const imageArrayBuffer = await response.arrayBuffer()
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64")

  return { mimeType: mime, base64: base64ImageData }
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

  await Promise.all(
    validation.data.urls.map(async (url) => {
      try {
        successfulImages.push(await fetchRemoteImageAsBase64(url))
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
