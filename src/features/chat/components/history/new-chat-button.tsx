"use client"

import { useRouter } from "next/navigation"
import { startTransition, useCallback } from "react"
import { useChatStore } from "../../store/chat-store"

export const NewChatButton = () => {
  const router = useRouter()
  const resetGeneratedPrompts = useChatStore((s) => s.resetGeneratedPrompts)

  const handleNewChat = useCallback(() => {
    resetGeneratedPrompts()
    startTransition(() => {
      router.push("/chat")
    })
  }, [router, resetGeneratedPrompts])

  return (
    <button
      type="button"
      onClick={handleNewChat}
      title="Nueva Sesión"
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 active:scale-95"
    >
      <span className="icon-[lucide--plus] size-4 shrink-0" />
      <span>Nuevo</span>
    </button>
  )
}
