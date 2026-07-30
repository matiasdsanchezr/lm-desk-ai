"use client"

import { useCallback, useState } from "react"

export function useCopyToClipboard(resetDelayMs = 2000) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), resetDelayMs)
      } catch (err) {
        console.error("Error al copiar al portapapeles", err)
      }
    },
    [resetDelayMs]
  )

  return { isCopied, copy }
}
