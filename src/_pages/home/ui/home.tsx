import Link from "next/link"
import { Hero } from "./hero"

export const Home = () => {
  return (
    <main className="relative min-h-dvh bg-background font-sans selection:bg-primary/10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />
      <Hero />

      {/* Contenido Principal */}
      <section
        id="how-it-works"
        className="container mx-auto max-w-5xl px-4 py-20 sm:py-32"
      >
        {/* Sección: Cómo funciona */}
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Flujo de trabajo optimizado para desarrolladores
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            Obtén respuestas precisas de los LLMs sin enviar archivos
            innecesarios ni desperdiciar tokens de contexto.
          </p>
        </div>

        {/* Bento Grid de Características */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* Tarjeta - Selección de Archivos */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-8 md:col-span-2 dark:border-zinc-800/80 dark:bg-zinc-900/30">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                <h3 className="text-lg font-bold">Selecciona tus Archivos</h3>
                <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                  Utiliza nuestro árbol de archivos interactivo para marcar los
                  archivos de código relevantes. Puedes incluir dependencias
                  automáticamente si es necesario.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4 font-mono text-[10px] dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-2 border-b pb-2 dark:border-zinc-800">
                  <span className="icon-[lucide--code-2] size-3.5 text-primary" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    File Selector
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded bg-zinc-50 p-1.5 dark:bg-zinc-900">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      src/components/button.tsx
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1 text-[9px] font-semibold text-emerald-500">
                      Incluido
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 opacity-60">
                    <span>src/hooks/use-theme.ts</span>
                    <span className="text-zinc-400">Excluido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta - Menciones @ */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-8 dark:border-zinc-800/80 dark:bg-zinc-900/30">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  2
                </span>
                <h3 className="text-lg font-bold">Menciones Inteligentes</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Usa{" "}
                  <code className="rounded bg-zinc-200 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                    @
                  </code>{" "}
                  para indexar rápidamente archivos a tu prompt directamente
                  desde el editor.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="font-mono text-[10px] text-zinc-400">
                  Prompt Editor
                </div>
                <div className="mt-1.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                  Refactoriza{" "}
                  <span className="font-bold text-primary">@navbar</span>
                </div>
                <div className="mt-2 border-t pt-2 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                    <span className="icon-[lucide--search] size-3" />
                    <span>Buscando archivos...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta - Formato XML/Markdown */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-8 dark:border-zinc-800/80 dark:bg-zinc-900/30">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  3
                </span>
                <h3 className="text-lg font-bold">Generación Optimizada</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Estructura el código en bloques XML legibles por modelos de
                  razonamiento (Reasoning Models).
                </p>
              </div>

              {/* XML Output simulado */}
              <div className="rounded-xl border border-zinc-200 bg-white p-3 font-mono text-[9px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
                <div>{`<file path="button.tsx">`}</div>
                <div className="pl-3 text-zinc-600 dark:text-zinc-400">{`export function Button() { ... }`}</div>
                <div>{`</file>`}</div>
              </div>
            </div>
          </div>

          {/* Tarjeta - Integración de Modelos */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-8 md:col-span-2 dark:border-zinc-800/80 dark:bg-zinc-900/30">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Listo para tu Stack de IA</h3>
                <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                  LM Desk genera prompts empaquetados en un formato XML/Markdown
                  estandarizado, ideal para arquitecturas de razonamiento
                  profundo como Claude, GPT y Gemini.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <span className="icon-[simple-icons--googlecloud] size-3.5" />{" "}
                  Vertex AI
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <span className="icon-[simple-icons--nvidia] size-3.5" />{" "}
                  NVIDIA NIM
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <span className="icon-[simple-icons--openai] size-3.5" />{" "}
                  OpenAI
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  <span className="icon-[simple-icons--anthropic] size-3.5" />{" "}
                  Anthropic
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enlace a la documentación de despliegue y uso */}
        <Link
          href="/about"
          className="group mx-auto mt-12 flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-5 transition-all hover:border-primary/40 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:hover:border-primary/40 dark:hover:bg-zinc-900/50"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
            <span className="icon-[lucide--book-open] size-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Guía de Despliegue y Uso
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Consulta los pasos específicos para configurar, desplegar y
              utilizar LM Desk localmente en nuestra documentación completa.
            </p>
          </div>
          <span className="icon-[lucide--arrow-right] size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        {/* Banner CTA Final */}
        <div className="relative mt-24 overflow-hidden rounded-3xl bg-zinc-950 p-8 text-zinc-100 sm:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3f3f4620_1px,transparent_1px),linear-gradient(to_bottom,#3f3f4620_1px,transparent_1px)] bg-size-[20px_20px] opacity-30" />

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                ¿Listo para potenciar tu desarrollo?
              </h2>
              <p className="mx-auto max-w-lg text-sm text-zinc-400">
                No vuelvas a perder tiempo copiando y pegando archivos de manera
                desordenada. Deja que LM Desk estructure el contexto por ti.
              </p>
            </div>
            <Link
              href="/chat"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02]"
            >
              Ir al Entorno de Análisis
              <span className="icon-[lucide--arrow-right] size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
