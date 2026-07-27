// src/app/(main)/layout.tsx
import { Footer } from "@/components/shared/footer"
import { Navbar } from "@/components/shared/navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
