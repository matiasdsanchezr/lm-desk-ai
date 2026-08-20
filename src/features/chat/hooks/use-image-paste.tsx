"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { ImageFile } from "@/shared/types/image-file"
import { useCallback } from "react"

export function useImagePaste() {
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageItems: File[] = []

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile()
        if (file) {
          imageItems.push(file)
        }
      }
    }

    if (imageItems.length === 0) return

    e.preventDefault()

    const readFileAsDataUrl = (file: File): Promise<ImageFile> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          if (result) {
            resolve({
              mimeType: file.type || "image/png",
              base64: result,
            })
          } else {
            reject(new Error("No se pudo leer el archivo de imagen"))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    Promise.all(imageItems.map(readFileAsDataUrl))
      .then((newImages) => {
        const { addImageFiles } = useFileExplorerStore.getState()
        addImageFiles(newImages)
      })
      .catch((err) => {
        console.error("Error al procesar las imágenes del portapapeles:", err)
      })
  }, [])

  return { handlePaste }
}
