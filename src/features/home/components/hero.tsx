import { cn } from "@/lib/utils"
import Link from "next/link"
import { FeatureCard } from "./featured-card"

export function Hero({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "relative isolate overflow-hidden border-b border-zinc-200/80 bg-zinc-50/30 pt-20 pb-20 sm:pt-28 sm:pb-28 dark:border-zinc-800/80 dark:bg-zinc-950/20",
        className
      )}
    >
      {/* Grid Decorativo Avanzado */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:14px_24px]"
      />

      {/* Luces de Neón / Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden"
      >
        <div className="w-[1000px] flex-none translate-y-[-20%] justify-center">
          <div className="h-[350px] w-[600px] rounded-full bg-primary/15 opacity-50 blur-[120px] md:h-[500px] md:w-[900px]" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Título Principal */}
          <h1
            id="hero-title"
            className="max-w-3xl text-4xl font-black tracking-tight text-balance text-zinc-900 sm:text-6xl dark:text-zinc-50"
          >
            Optimiza tus Prompts para LLMs con{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                LM Desk
              </span>
              <span className="absolute bottom-1 left-0 -z-10 h-2 w-full -rotate-1 rounded bg-primary/10" />
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="max-w-2xl text-sm text-balance text-muted-foreground sm:text-base md:text-lg">
            Carga tu código fuente, selecciona los archivos clave con
            autocompletado inteligente y genera un contexto estructurado y listo
            para alimentar a cualquier modelo de Inteligencia Artificial.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/chat"
              className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-zinc-900 px-6 text-sm font-medium text-zinc-50 shadow-md transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Comenzar a Analizar
              <span className="icon-[lucide--arrow-right] size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-6 text-sm font-medium text-zinc-950 backdrop-blur-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* Vista Previa Interactiva de la App (Mockup de Código) */}
        <div className="relative mt-16 rounded-2xl border border-zinc-200/80 bg-white/60 p-2 shadow-2xl shadow-zinc-200/50 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:shadow-none">
          <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 pt-1 pb-2 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-rose-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="rounded-md bg-zinc-100 px-3 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              workspace/lm-desk/prompt-builder
            </div>
            <div className="size-4" />
          </div>

          <div className="grid grid-cols-1 divide-y divide-zinc-200/80 md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-zinc-800/80">
            {/* Sidebar Mockup */}
            <div className="space-y-3 p-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="icon-[lucide--folder] size-3.5" /> EXPLORADOR
              </div>
              <div className="space-y-1.5 pl-2">
                <div className="flex items-center gap-2 font-medium text-primary">
                  <span className="icon-[lucide--check-square-2] size-3.5" />
                  <span>src/app/page.tsx</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-primary">
                  <span className="icon-[lucide--check-square-2] size-3.5" />
                  <span>src/components/hero.tsx</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <span className="icon-[lucide--square] size-3.5" />
                  <span>package.json</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-primary">
                  <span className="icon-[lucide--check-square-2] size-3.5" />
                  <span>src/lib/utils.ts</span>
                </div>
              </div>
            </div>

            {/* Editor Mockup */}
            <div className="col-span-2 p-4 font-mono text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
              <div className="text-zinc-400">
                {`// Describe tu requerimiento y menciona archivos con @`}
              </div>
              <div className="mt-2">
                Necesito refactorizar el componente{" "}
                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                  @hero.tsx
                </span>{" "}
                para que consuma las utilidades de{" "}
                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                  @utils.ts
                </span>
                .
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-200/80 pt-3 dark:border-zinc-800/80">
                <span className="text-[10px] text-zinc-400">
                  Contexto: 3 archivos seleccionados
                </span>
                <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                  <span className="icon-[lucide--copy] size-3" /> Copiar
                  Contexto
                </button>
              </div>
            </div>
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
            badge="Multi-Model"
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
