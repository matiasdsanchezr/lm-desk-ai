import { TooltipProvider } from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "LM Desk",
  description:
    "Aplicación para analizar código mediante LLMs y generar sugerencias de mejoras.",
  openGraph: {
    title: "Code Advisor",
    description: "Next.js - TypeScript - Node.js",
    locale: "es_AR",
  },
  keywords: ["AI", "LLM", "Coding", "Agent"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className={`dark antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
