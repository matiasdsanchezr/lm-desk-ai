import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: string
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-2xl border border-zinc-200/50 bg-white/50 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-lg hover:shadow-primary/5 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:border-primary/30 dark:hover:bg-zinc-900">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
        <span className={cn(icon, "size-6")} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

export function Hero({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "relative isolate overflow-hidden border-b border-zinc-200 bg-zinc-50/50 pt-20 pb-16 sm:pt-28 sm:pb-20 dark:border-zinc-800 dark:bg-zinc-950/20",
        className
      )}
    >
      {/* Fondos decorativos y cuadrícula */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex justify-center"
      >
        <div className="size-[350px] rounded-full bg-primary/10 opacity-70 blur-3xl md:size-[600px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        {/* Contenido Principal */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Badge de Novedad */}
          <div className="inline-flex animate-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary duration-500 fade-in slide-in-from-top-4">
            <span className="icon-[lucide--sparkles] size-3.5 animate-pulse" />
            <span>Prepara tu contexto de código eficientemente</span>
          </div>

          {/* Título */}
          <div className="flex animate-in items-center gap-3 duration-700 fade-in slide-in-from-bottom-3">
            <h1
              id="hero-title"
              className="bg-linear-to-b from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500"
            >
              Optimiza tus Prompts con{" "}
              <span className="text-primary">LM Desk</span>
            </h1>
          </div>

          {/* Subtítulo */}
          <p className="max-w-2xl animate-in text-sm text-balance text-muted-foreground duration-1000 fade-in slide-in-from-bottom-4 sm:text-base md:text-lg">
            Carga tu código fuente, selecciona los archivos clave con
            autocompletado inteligente y genera un contexto estructurado y listo
            para alimentar a cualquier modelo de Inteligencia Artificial.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/chat"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Comenzar a Analizar
              <span className="icon-[lucide--arrow-right] size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FeatureCard
            icon="icon-[lucide--folder-git-2]"
            title="Explorador de Archivos"
            description="Visualiza la estructura de tu proyecto y selecciona solo los archivos que necesitas para el contexto."
          />
          <FeatureCard
            icon="icon-[lucide--cpu]"
            title="Agnóstico al Modelo"
            description="Diseñado para trabajar con Vertex AI, NVIDIA NIM, OpenAI, Claude o LLMs locales."
          />
          <FeatureCard
            icon="icon-[lucide--terminal]"
            title="Menciones con @"
            description="Escribe tus requerimientos y etiqueta archivos directamente en tu consulta usando la sintaxis @archivo."
          />
        </div>
      </div>
    </section>
  )
}
