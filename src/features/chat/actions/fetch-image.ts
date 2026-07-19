import { ImageFile } from "@/types/image-file"

export const fetchImage = async (src: string): Promise<ImageFile> => {
  const response = await fetch(src)
  if (!response.ok) throw new Error(`Error al cargar la imagen con url ${src}`)

  const mime =
    response.headers.get("content-type") || response.headers.get("Content-Type")

  if (!mime || !mime.startsWith("image/"))
    throw new Error(`Error al cargar la imagen, MIME invalido. Url: ${src}`)

  const imageArrayBuffer = await response.arrayBuffer()
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64")
  return { mimeType: mime, base64: base64ImageData }
}
