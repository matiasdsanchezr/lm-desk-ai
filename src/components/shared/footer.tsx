"use client"
import Link from "next/link"

const GITHUB_REPO_URL = "https://github.com/matiasdsanchezr/lm-desk-ai"

const techStack = [
  { icon: "icon-[simple-icons--nextdotjs]", label: "Next.js" },
  { icon: "icon-[simple-icons--tailwindcss]", label: "Tailwind" },
  { icon: "icon-[simple-icons--typescript]", label: "TypeScript" },
  { icon: "icon-[simple-icons--nvidia]", label: "NVIDIA NIM" },
  { icon: "icon-[simple-icons--googlecloud]", label: "Vertex AI" },
]

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Acerca de", href: "/about" },
  { label: "Chat", href: "/chat" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full border-t border-border/60 bg-background/80 backdrop-blur-md">
      {/* Línea decorativa superior con gradiente */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Branding */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950">
                <span className="icon-[ix--document-ai] size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">
                  LM Desk
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Contexto inteligente para LLMs
                </p>
              </div>
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Herramienta local para empaquetar y analizar código fuente
              mediante Modelos de Lenguaje de Gran Escala.
            </p>
          </div>

          {/* Navegación */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Navegación
            </h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Stack Tecnológico */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                  title={tech.label}
                >
                  <span className={tech.icon} aria-hidden="true" />
                  {tech.label}
                </span>
              ))}
            </div>
          </div>

          {/* Repositorio */}
          <div className="space-y-3">
            <h4 className="font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Código Fuente
            </h4>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/40 px-3.5 text-xs font-medium text-foreground transition-all hover:scale-[1.02] hover:border-primary/40 hover:bg-muted"
            >
              <span className="icon-[lucide--github] size-4" />
              <span className="font-mono">matiasdsanchezr/lm-desk-ai</span>
              <span className="icon-[lucide--arrow-up-right] size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="text-[10px] text-muted-foreground">
              Proyecto open-source. Contribuciones bienvenidas.
            </p>
          </div>
        </div>

        {/* Línea inferior: copyright y metadatos */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-muted-foreground">
            © {currentYear} LM Desk AI · Construido con Next.js & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
