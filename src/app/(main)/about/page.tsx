import { AboutView } from "@/features/marketing"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acerca de - LM Desk",
  description:
    "Documentación completa para desplegar, configurar y utilizar LM Desk localmente con tus LLMs preferidos.",
}

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh bg-background font-sans text-foreground selection:bg-primary/10">
      <AboutView />
    </main>
  )
}
