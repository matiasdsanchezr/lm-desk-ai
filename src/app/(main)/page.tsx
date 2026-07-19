import { Hero } from "@/components/shared/hero"
import { SettingsDrawer } from "@/features/settings"
import Link from "next/link"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="relative min-h-dvh bg-background font-sans selection:bg-primary/10">
      {/* Fondo de rejilla decorativa */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />

      <Suspense fallback={<></>}>
        <SettingsDrawer />
      </Suspense>

      <Hero />

      {/* Contenido Principal */}
      <section
        id="how-it-works"
        className="container mx-auto max-w-5xl px-4 py-16 sm:py-24"
      >
        {/* Sección: Cómo funciona */}
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Flujo de trabajo optimizado para desarrolladores
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            Obtén respuestas precisas de los LLMs sin enviar archivos
            innecesarios ni desperdiciar tokens de contexto.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {/* Paso 1 */}
          <div className="relative space-y-4 rounded-2xl border border-zinc-200/50 bg-muted/20 p-6 dark:border-zinc-800/50">
            <div className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-md">
              1
            </div>
            <h3 className="pt-2 font-semibold">Selecciona tus Archivos</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Utiliza nuestro árbol de archivos interactivo para marcar los
              archivos de código relevantes. Puedes incluir dependencias
              automáticamente si es necesario.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="relative space-y-4 rounded-2xl border border-zinc-200/50 bg-muted/20 p-6 dark:border-zinc-800/50">
            <div className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-md">
              2
            </div>
            <h3 className="pt-2 font-semibold">Formula tu Consulta</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Redacta tu consulta en nuestro editor con soporte de menciones.
              Usa{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                @
              </code>{" "}
              para indexar rápidamente archivos a tu prompt.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="relative space-y-4 rounded-2xl border border-zinc-200/50 bg-muted/20 p-6 dark:border-zinc-800/50">
            <div className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-md">
              3
            </div>
            <h3 className="pt-2 font-semibold">Genera y Ejecuta</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Revisa el prompt estructurado en formato Markdown optimizado.
              Cópialo directamente o procésalo con el chat interactivo integrado
              para obtener respuestas inmediatas.
            </p>
          </div>
        </div>

        {/* Sección: Integración de Modelos */}
        <div className="mt-24 rounded-2xl border border-zinc-200/60 bg-linear-to-b from-zinc-50 to-white p-8 text-center dark:border-zinc-800/60 dark:from-zinc-950/40 dark:to-zinc-900/10">
          <div className="mx-auto max-w-xl space-y-4">
            <h3 className="text-lg font-semibold">
              Listo para tu stack de IA preferido
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              LM Desk genera prompts empaquetados en un formato XML/Markdown
              estandarizado, ideal para arquitecturas de razonamiento profundo
              (Reasoning models) como Claude 3.5 Sonnet, GPT-4o y Gemini 1.5
              Pro.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1">
                <span className="icon-[simple-icons--googlecloud] size-3.5" />{" "}
                Vertex AI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1">
                <span className="icon-[simple-icons--nvidia] size-3.5" /> NVIDIA
                NIM
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1">
                <span className="icon-[simple-icons--openai] size-3.5" /> OpenAI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1">
                <span className="icon-[simple-icons--anthropic] size-3.5" />{" "}
                Anthropic
              </span>
            </div>
          </div>
        </div>

        {/* Banner CTA Final */}
        <div className="mt-20 flex flex-col items-center gap-6 rounded-3xl bg-zinc-900 px-6 py-12 text-center dark:bg-zinc-100 dark:text-zinc-950">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ¿Listo para potenciar tu desarrollo?
            </h2>
            <p className="mx-auto max-w-lg text-sm text-zinc-400 dark:text-zinc-600">
              No vuelvas a perder tiempo copiando y pegando archivos de manera
              desordenada. Deja que LM Desk lo haga por ti.
            </p>
          </div>
          <Link
            href="/chat"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] dark:hover:bg-primary/95"
          >
            Ir al Entorno de Análisis
            <span className="icon-[lucide--arrow-right] size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  )
}
