import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LM Desk",
  description:
    "Aplicación para analizar código mediante LLMs y generar sugerencias de mejoras.",
  openGraph: {
    title: "Code Advisor",
    description: "Next.js · TypeScript · Node.js · GenAi · Vertex · NVIDIA NIM",
    locale: "es_AR",
  },
  keywords: ["AI", "LLM", "Coding", "Agent"],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
