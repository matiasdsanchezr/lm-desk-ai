import { ImageFile } from "../types/image-file"

const thumbnailCache = new Map<string, string>()
const MAX_CACHE_SIZE = 100

/**
 * Genera una miniatura ultra ligera en formato WebP a partir de un Data URI o Blob
 */
export async function getOrCreateThumbnail(
  src: string,
  maxDimension = 160,
  quality = 0.75
): Promise<string> {
  if (!src) return ""

  if (thumbnailCache.has(src)) {
    return thumbnailCache.get(src)!
  }

  try {
    const thumbnail = await generateThumbnail(src, maxDimension, quality)

    if (thumbnailCache.size >= MAX_CACHE_SIZE) {
      const firstKey = thumbnailCache.keys().next().value
      if (firstKey) thumbnailCache.delete(firstKey)
    }

    thumbnailCache.set(src, thumbnail)
    return thumbnail
  } catch (error) {
    console.warn(
      "[Thumbnail] Falló la generación de miniatura, usando fuente original:",
      error
    )
    return src
  }
}

function generateThumbnail(
  src: string,
  maxDimension: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      if (width === 0 || height === 0) {
        resolve(src)
        return
      }

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) {
        resolve(src)
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "medium"
      ctx.drawImage(img, 0, 0, width, height)

      let dataUrl = canvas.toDataURL("image/webp", quality)
      if (!dataUrl.startsWith("data:image/webp")) {
        dataUrl = canvas.toDataURL("image/jpeg", quality)
      }

      resolve(dataUrl)
    }

    img.onerror = () =>
      reject(new Error("No se pudo cargar la imagen para redimensionar"))
    img.src = src
  })
}

export function toDataUri(image: ImageFile): string {
  return image.base64.startsWith("data:")
    ? image.base64
    : `data:${image.mimeType || "image/png"};base64,${image.base64}`
}
