import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Acerca de - LM Desk",
  description:
    "Documentación completa para desplegar, configurar y utilizar LM Desk localmente con tus LLMs preferidos.",
}

const GITHUB_REPO_URL = "https://github.com/matiasdsanchezr/lm-desk-ai"

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh bg-background font-sans text-foreground selection:bg-primary/10">
      {/* Fondo con grilla decorativa */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Cabecera / Hero de Documentación */}
        <div className="flex flex-col items-start gap-4 border-b border-border/60 pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <span className="icon-[lucide--book-open] size-3.5" />
            <span>Documentación del Sistema</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Acerca de <span className="text-primary">LM Desk</span>
          </h1>

          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            LM Desk es una herramienta de entorno local diseñada para
            desarrolladores. Facilita la extracción, empaquetado estructurado
            (XML/Markdown) y análisis interactivo del código fuente de proyectos
            locales mediante Modelos de Lenguaje de Gran Escala (LLMs).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-zinc-50 shadow-sm transition-transform hover:scale-[1.02] dark:bg-zinc-100 dark:text-zinc-900"
            >
              <span className="icon-[lucide--github] size-4" />
              <span>Ver Repositorio en GitHub</span>
              <span className="icon-[lucide--external-link] size-3.5 opacity-70" />
            </a>
            <Link
              href="/chat"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-medium transition-colors hover:bg-muted"
            >
              <span className="icon-[lucide--bot] size-4 text-primary" />
              <span>Ir al Entorno de Chat</span>
            </Link>
          </div>
        </div>

        {/* Sección 1: Despliegue y Ejecución Local */}
        <section className="space-y-6 pt-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="icon-[lucide--terminal] size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                1. Despliegue y Ejecución Local
              </h2>
              <p className="text-xs text-muted-foreground">
                Instrucciones para iniciar la aplicación en tu máquina local.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xs">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="icon-[lucide--git-branch] size-4 text-primary" />
                Requisitos Previos
              </h3>
              <ul className="mt-3 space-y-1.5 font-mono text-xs text-muted-foreground">
                <li>• Node.js &gt;= 20.0.0</li>
                <li>• npm, pnpm o bun</li>
                <li>• Claves API (NVIDIA NIM, Google Vertex, OpenAI, etc.)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xs">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <span className="icon-[lucide--folder-search] size-4 text-primary" />
                Especificar Proyecto Objetivo
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Puedes analizar cualquier proyecto pasando su ruta con la
                bandera{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                  -t
                </code>{" "}
                o configurando la variable{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                  TARGET_PROJECT_PATH
                </code>
                .
              </p>
            </div>
          </div>

          {/* Bloque de Comandos CLI */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 text-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 text-xs text-zinc-400">
              <span className="flex items-center gap-2 font-mono">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                bash / terminal
              </span>
              <span>Comandos de inicio</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
              <code>{`# 1. Clonar el repositorio
git clone ${GITHUB_REPO_URL}.git
cd lm-desk-ai

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo apuntando a tu proyecto
npm run dev -- -t /ruta/a/tu/proyecto-codigo

# O iniciar en modo producción:
npm run build
npm start -- -t /ruta/a/tu/proyecto-codigo`}</code>
            </pre>
          </div>
        </section>

        {/* Sección 2: Configuración del Sistema */}
        <section className="space-y-6 pt-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="icon-[lucide--sliders] size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                2. Configuración de Entorno e IA
              </h2>
              <p className="text-xs text-muted-foreground">
                Variables de entorno y drawer de preferencias.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <h3 className="text-sm font-bold text-foreground">
                Variables de Entorno (`.env.local`)
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Crea un archivo{" "}
                <code className="font-mono text-foreground">.env.local</code> en
                la raíz del proyecto para habilitar los proveedores de IA
                deseados:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-border/40 bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                <code>{`# Ruta del almacenamiento local para chats y plantillas de prompts
STORAGE_PATH=/tu/ruta/local/lm-desk-data

# Proveedores de LLM (Configura el que vayas a usar)
NVIDIA_NIM_API_KEY=nvapi-...
OPENAI_API_KEY=sk-...
GOOGLE_VERTEX_PROJECT_ID=tu-proyecto-gcp
GOOGLE_VERTEX_LOCATION=us-central1`}</code>
              </pre>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card/20 p-4">
                <span className="icon-[lucide--cpu] size-5 text-primary" />
                <h4 className="mt-2 text-xs font-semibold">
                  Motor de Inferencia
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Selecciona desde el menú lateral el proveedor (NVIDIA NIM,
                  Vertex, OpenAI) y modelo activo.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/20 p-4">
                <span className="icon-[lucide--thermometer] size-5 text-primary" />
                <h4 className="mt-2 text-xs font-semibold">
                  Temperatura & Top P
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ajusta la aleatoriedad. Valores bajos (0.1 - 0.3) son ideales
                  para refactorización exacta.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/20 p-4">
                <span className="icon-[lucide--file-text] size-5 text-primary" />
                <h4 className="mt-2 text-xs font-semibold">
                  Plantillas de Prompts
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Guarda y rebaraja instrucciones de sistema personalizadas en
                  archivos Markdown locales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: Flujo de Consultas */}
        <section className="space-y-6 pt-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="icon-[lucide--message-square-code] size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                3. ¿Cómo llevar a cabo las consultas?
              </h2>
              <p className="text-xs text-muted-foreground">
                Pasos recomendados para obtener las mejores respuestas.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">
                  Selección de Contexto de Archivos
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Abre el explorador de archivos y marca únicamente los módulos
                  o carpetas relevantes para tu tarea. Marca la casilla de
                  <strong> &quot;Incluir dependencias&quot;</strong> si
                  necesitas resolver las importaciones del proyecto
                  automáticamente.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">
                  Redacción con Menciones Inteligentes (@)
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  En el editor de tareas, escribe{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                    @
                  </code>{" "}
                  para desplegar el autocompletado de archivos del proyecto. Al
                  seleccionar un archivo en el menú, este se asociará
                  automáticamente al contexto.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">
                  Generación y Revisión del Prompt
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Haz clic en{" "}
                  <strong>&quot;Generar y revisar prompt&quot;</strong>. Podrás
                  copiar el bloque XML unificado completo para llevarlo a
                  plataformas externas (como ChatGPT, Claude Web, ChatGPT Plus)
                  o presionar <strong>&quot;Generar Respuesta&quot;</strong>{" "}
                  para procesarlo con el LLM configurado localmente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Banner GitHub y Contribuciones */}
        <div className="mt-16 rounded-3xl border border-border/60 bg-muted/30 p-8 text-center sm:p-10">
          <span className="icon-[lucide--sparkles] size-8 text-primary" />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">
            Proyecto de Código Abierto
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground sm:text-sm">
            Si encuentras útil esta herramienta o deseas proponer mejoras,
            visita el repositorio oficial en GitHub.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02]"
            >
              <span className="icon-[lucide--github] size-4" />
              <span>matiasdsanchezr/lm-desk-ai</span>
              <span className="icon-[lucide--arrow-up-right] size-4" />
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
