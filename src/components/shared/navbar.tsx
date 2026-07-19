"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const Navbar = () => {
  const pathname = usePathname()

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Analizador", href: "/chat" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Marca / Logo (Alineado a la izquierda) */}
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
              <span className="icon-[mingcute--chat-4-ai-line] size-5" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-50">
                LM Desk
              </h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Contexto inteligente para LLMs
              </p>
            </div>
          </Link>
        </div>

        {/* Navegación Central (Permanecerá fija en el centro) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Acciones del lado derecho (Alineado a la derecha, mantiene flex-1) */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {pathname !== "/chat" && (
            <Link
              href="/chat"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-xs font-medium text-zinc-50 transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Comenzar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
