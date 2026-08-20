"use client"

import { useRouter } from "next/navigation"
import { startTransition, useCallback } from "react"
import { useChatActions } from "../../store/chat-store"

export const NewChatButton = () => {
  const router = useRouter()
  const { resetGeneratedPrompts } = useChatActions()

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
      className="inline-flex size-8 items-center justify-center gap-1.5 rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:scale-95 group-data-[collapsible=icon]:size-8 md:h-8 md:w-auto md:px-2.5 md:text-xs md:font-medium"
    >
      <span className="icon-[lucide--plus] size-4 shrink-0" />
      <span className="hidden group-data-[collapsible=icon]:hidden md:inline">
        Nuevo
      </span>
    </button>
  )
}
