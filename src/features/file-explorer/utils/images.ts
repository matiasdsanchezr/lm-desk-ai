import { ImageFile } from "@/shared/types/image-file"

const IMAGE_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

/**
 * Carga una imagen remota y la convierte a un formato Base64 tipado
 */
export const fetchImage = async (src: string): Promise<ImageFile> => {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Error al cargar la imagen con URL: ${src}`)
  }

  const mime =
    response.headers.get("content-type") || response.headers.get("Content-Type")

  if (!mime || !mime.startsWith("image/")) {
    throw new Error(`Error al cargar la imagen, MIME inválido. URL: ${src}`)
  }

  const imageArrayBuffer = await response.arrayBuffer()
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64")

  return { mimeType: mime, base64: base64ImageData }
}

/**
 * Obtiene el MIME Type adecuado para la extensión de la imagen.
 */
export function getImageMimeType(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase()
  return IMAGE_MIME_TYPES[ext] ?? "application/octet-stream"
}

/**
 * Verifica si la ruta dada corresponde a un archivo de imagen soportado.
 */
export function isImagePath(filePath: string): boolean {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase()
  return ext in IMAGE_MIME_TYPES
}
