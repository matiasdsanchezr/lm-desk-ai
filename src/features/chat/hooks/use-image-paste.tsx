"use client"

import { ImageFile } from "@/shared/types/image-file"
import { useCallback } from "react"
import { useChatActions } from "../store/chat-store"

const fileToDataUrl = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        mimeType: file.type || "image/png",
        base64: reader.result as string,
      })
    reader.onerror = () =>
      reject(new Error(`Error al leer imagen: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export function useImagePaste() {
  const { addAttachedImages } = useChatActions()

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || [])
      const imageFiles = items
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null)

      if (imageFiles.length === 0) return

      e.preventDefault()

      try {
        const loadedImages = await Promise.all(imageFiles.map(fileToDataUrl))
        addAttachedImages(loadedImages)
      } catch (err) {
        console.error("[useImagePaste] Error al procesar imágenes:", err)
      }
    },
    [addAttachedImages]
  )

  return { handlePaste }
}
