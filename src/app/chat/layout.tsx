import { SettingsDrawer } from "@/features/settings/components/settings-drawer"
import { Metadata } from "next"
import React, { Suspense } from "react"

export const metadata: Metadata = {
  title: "Chat - LM Desk",
  description: "Generar consultas para LLMs sobre tus archivos locales.",
}

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-background font-sans selection:bg-primary/10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />

      <Suspense fallback={null}>
        <SettingsDrawer />
      </Suspense>

      {children}
    </main>
  )
}
