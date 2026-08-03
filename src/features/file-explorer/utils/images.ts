import { ImageFile } from "@/shared/types/image-file"

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
