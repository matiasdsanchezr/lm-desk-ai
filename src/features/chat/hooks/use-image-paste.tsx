"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useCallback } from "react"

export function useImagePaste() {
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile()
        if (!file) continue

        const reader = new FileReader()
        const { imageFiles, setImageFiles } = useFileExplorerStore.getState()
        reader.onload = (uploadEvent) => {
          const base64 = uploadEvent.target?.result as string
          if (base64) {
            setImageFiles([...imageFiles, { mimeType: file.type, base64 }])
          }
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }, [])

  return { handlePaste }
}
