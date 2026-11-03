import type { ReactNode } from "react"

// CORRECCIÓN: Passthrough directo. El layout principal ya se encuentra en src/app/chat/layout.tsx
export default function ExistingChatLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
