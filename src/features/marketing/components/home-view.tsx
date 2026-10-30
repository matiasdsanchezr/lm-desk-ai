import Link from "next/link"
import { Hero } from "./hero"

export const HomeView = () => {
  return (
    <>
      {/* 1. Hero Principal */}
      <Hero />

      {/* 2. Barra de Ventajas Clave */}
      <section
        aria-label="Ventajas clave de la plataforma"
        className="border-b border-border/40 bg-muted/20 backdrop-blur-xs"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-4 sm:divide-y-0">
          <div className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="icon-[lucide--shield-check] size-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">100% Local</p>
              <p className="text-[11px] text-muted-foreground">Tu código nunca sale de tu equipo</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="icon-[lucide--boxes] size-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Grafo de Dependencias</p>
              <p className="text-[11px] text-muted-foreground">Resolución automática de imports</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="icon-[lucide--gauge] size-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Ahorro de Tokens</p>
              <p className="text-[11px] text-muted-foreground">Evita volcar carpetas innecesarias</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="icon-[lucide--sparkles] size-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Reasoning-Ready</p>
              <p className="text-[11px] text-muted-foreground">Formato XML amigable con Claude/o1</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección: Cómo Funciona (Bento Grid) */}
      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-4 py-20 sm:py-28"
        aria-labelledby="features-heading"
      >
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="icon-[lucide--workflow] size-3.5" />
            <span>Flujo de Trabajo Inteligente</span>
          </div>
          <h2
            id="features-heading"
            className="text-3xl font-black tracking-tight text-balance sm:text-4xl md:text-5xl"
          >
            Del código local al prompt perfecto en tres clics
          </h2>
          <p className="mx-auto max-w-2xl text-xs text-balance text-muted-foreground sm:text-sm">
            Olvídate de recortar archivos a mano. LM Desk indexa tu repositorio objetivo, detecta qué
            código es indispensable y empaqueta el contexto en un único bloque estructurado.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Tarjeta 1 (2 cols): Árbol Interactivo y Medidor de Tokens */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 sm:p-8 md:col-span-2 backdrop-blur-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                    1
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Selección Quirúrgica
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Explorador de Archivos & Grafo de Dependencias
                </h3>
                <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Navega la estructura de tu proyecto y selecciona solo los módulos necesarios. Si activas{" "}
                  <strong className="text-foreground">&quot;Incluir dependencias&quot;</strong>, LM Desk analizará
                  las declaraciones de importación de JavaScript/TypeScript para incluir componentes y
                  utilidades referenciadas automáticamente.
                </p>
              </div>

              {/* Mockup del Explorador */}
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/80 shadow-md">
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="icon-[lucide--folder-tree] size-4 text-primary" />
                    <span className="font-mono text-xs font-medium text-foreground">
                      target-project/src
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      3 seleccionados
                    </span>
                  </div>
                </div>

                <div className="p-3 font-mono text-xs space-y-1.5">
                  {/* File 1 */}
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5 text-foreground transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="icon-[lucide--check-square-2] size-3.5 text-primary" />
                      <span className="icon-[lucide--file-code] size-3.5 text-primary" />
                      <span className="font-medium">src/app/api/chat/route.ts</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">1.8 kB</span>
                  </div>

                  {/* File 2 */}
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5 text-foreground transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="icon-[lucide--check-square-2] size-3.5 text-primary" />
                      <span className="icon-[lucide--file-code] size-3.5 text-primary" />
                      <span className="font-medium">src/features/chat/service.ts</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      Dep resuelta
                    </span>
                  </div>

                  {/* File 3 */}
                  <div className="flex items-center justify-between rounded-lg px-3 py-1.5 text-muted-foreground opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="icon-[lucide--square] size-3.5" />
                      <span className="icon-[lucide--file-text] size-3.5" />
                      <span>README.md</span>
                    </div>
                    <span className="text-[10px]">ignorado</span>
                  </div>
                </div>

                {/* Barra de progreso de tokens */}
                <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Tokens Estimados del Contexto:</span>
                    <span className="font-mono font-semibold text-foreground">
                      3,420 / 128,000 <span className="text-emerald-500 font-normal">(-82% vs repo completo)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[12%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2 (1 col): Menciones Inteligentes @ */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 sm:p-8 backdrop-blur-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                    2
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Menciones Rápidas
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Autocompletado con @
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Indexa archivos sobre la marcha escribiendo{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                    @
                  </code>{" "}
                  en el editor para activar el autocompletado instantáneo.
                </p>
              </div>

              {/* Mockup de Popover @ */}
              <div className="rounded-2xl border border-border/80 bg-background/90 p-3.5 shadow-md">
                <div className="font-mono text-[11px] text-muted-foreground">
                  <span>Explicar cómo funciona </span>
                  <span className="rounded bg-primary/20 px-1 py-0.5 font-semibold text-primary">
                    @stream
                  </span>
                  <span className="animate-pulse">|</span>
                </div>

                {/* Popover flotante simulado */}
                <div className="mt-3 overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
                  <div className="border-b border-border/60 bg-muted/40 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground">
                    Sugerencias de archivos
                  </div>
                  <div className="p-1 space-y-0.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between rounded-md bg-primary px-2.5 py-1.5 text-primary-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="icon-[lucide--file-code] size-3" />
                        <span className="font-medium">resumable-stream.ts</span>
                      </div>
                      <span className="rounded bg-primary-foreground/20 px-1 text-[9px]">Enter ↵</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="icon-[lucide--file-code] size-3" />
                        <span>chat-stream-service.ts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 3 (1 col): XML Estructurado */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 sm:p-8 backdrop-blur-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Estructura Limpia
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Bloques XML Estandarizados
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  El prompt generado separa instrucciones, árbol del proyecto y archivos con rutas
                  relativas precisas.
                </p>
              </div>

              {/* Mockup de Código XML */}
              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-100 shadow-md dark:border-zinc-800/80">
                <div className="flex items-center justify-between pb-2 text-[10px] text-zinc-500 border-b border-zinc-800">
                  <span>prompt_output.xml</span>
                  <span className="icon-[lucide--copy] size-3.5 text-zinc-400" />
                </div>
                <div className="mt-2.5 space-y-1 text-zinc-300 text-[10.5px]">
                  <div>
                    <span className="text-purple-400">&lt;context&gt;</span>
                  </div>
                  <div className="pl-3">
                    <span className="text-blue-400">&lt;file</span>{" "}
                    <span className="text-amber-300">path</span>=
                    <span className="text-emerald-400">&quot;src/index.ts&quot;</span>
                    <span className="text-blue-400">&gt;</span>
                  </div>
                  <div className="pl-6 text-zinc-500">&#47;&#47; Código fuente aislado...</div>
                  <div className="pl-3">
                    <span className="text-blue-400">&lt;/file&gt;</span>
                  </div>
                  <div>
                    <span className="text-purple-400">&lt;/context&gt;</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-purple-400">&lt;instruction&gt;</span>
                  </div>
                  <div className="pl-3 text-emerald-300">Optimizar streaming SSE</div>
                  <div>
                    <span className="text-purple-400">&lt;/instruction&gt;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 4 (2 cols): Multi-Model & Inference Engines */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-border/70 bg-card/50 p-6 sm:p-8 md:col-span-2 backdrop-blur-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex h-full flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                    4
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Flexibilidad Absoluta
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Conexión Directa con tu Ecosistema de LLMs
                </h3>
                <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Utiliza tus propias credenciales o endpoints locales. Transmite tokens en tiempo real con
                  soporte nativo para <em>Resumable Stream</em>, ajuste de temperatura y plantillas de
                  sistema Markdown configurables.
                </p>
              </div>

              {/* Grid de Model Providers */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-3.5 transition-colors hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="icon-[simple-icons--nvidia] size-5 text-[#76B900]" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">NVIDIA NIM</p>
                    <p className="text-[10px] text-muted-foreground">Llama 3.3 / DeepSeek</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-3.5 transition-colors hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="icon-[simple-icons--googlecloud] size-5 text-[#4285F4]" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Vertex AI</p>
                    <p className="text-[10px] text-muted-foreground">Gemini 2.5 Flash / Pro</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-3.5 transition-colors hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="icon-[simple-icons--openai] size-5 text-foreground" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">OpenAI</p>
                    <p className="text-[10px] text-muted-foreground">GPT-4o / o1 / o3-mini</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-3.5 transition-colors hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="icon-[simple-icons--anthropic] size-5 text-[#D97757]" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Anthropic / Otros</p>
                    <p className="text-[10px] text-muted-foreground">Claude 3.7 Sonnet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección Comparativa: Sin LM Desk vs Con LM Desk */}
      <section
        aria-label="Comparativa de eficiencia"
        className="border-y border-border/40 bg-muted/20 py-20"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ¿Por qué preparar el contexto con LM Desk?
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              La calidad de la respuesta de un LLM depende del 90% de la precisión del contexto provisto.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Antes */}
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-destructive text-sm">
                <span className="icon-[lucide--x-circle] size-4.5" />
                <span>Enfoque Tradicional (Manual)</span>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--x] size-3.5 mt-0.5 text-destructive shrink-0" />
                  <span>Copiar y pegar archivos sueltos perdiendo las rutas y nombres de directorio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--x] size-3.5 mt-0.5 text-destructive shrink-0" />
                  <span>Olvido constante de dependencias cruzadas (tipos, helpers, hooks auxiliares).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--x] size-3.5 mt-0.5 text-destructive shrink-0" />
                  <span>Desperdicio de límites de tokens al volcar código irrelevante o assets innecesarios.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--x] size-3.5 mt-0.5 text-destructive shrink-0" />
                  <span>Alucinaciones frecuentes de la IA debido a estructuras de código ambiguas.</span>
                </li>
              </ul>
            </div>

            {/* Con LM Desk */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-primary text-sm">
                <span className="icon-[lucide--check-circle-2] size-4.5" />
                <span>Con LM Desk</span>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--check] size-3.5 mt-0.5 text-primary shrink-0" />
                  <span>Árbol de carpetas y archivos empaquetados en un formato XML delimitado y uniforme.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--check] size-3.5 mt-0.5 text-primary shrink-0" />
                  <span>Detección automática de dependencias TS/JS para incluir imports en un solo click.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--check] size-3.5 mt-0.5 text-primary shrink-0" />
                  <span>Control granular del consumo de tokens y exportación directa con un botón de copiado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="icon-[lucide--check] size-3.5 mt-0.5 text-primary shrink-0" />
                  <span>Ejecución directa en modelos de razonamiento (Claude, Gemini, Deepseek) o plataformas externas.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Acceso a Documentación Técnica */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <Link
          href="/about"
          className="group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-6 sm:flex-row sm:items-center sm:p-8 backdrop-blur-xs transition-all hover:border-primary/50 hover:bg-card hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <span className="icon-[lucide--book-open-check] size-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Guía de Despliegue Local & Configuración
                </h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Docs
                </span>
              </div>
              <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                Aprende a especificar repositorios con el flag <code className="font-mono text-foreground font-semibold">-t</code>, 
                configurar variables en <code className="font-mono text-foreground font-semibold">.env.local</code> y almacenar 
                historiales de chat localmente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span>Ver documentación</span>
            <span className="icon-[lucide--arrow-right] size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </section>

      {/* 6. Banner CTA Final */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:pb-28">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border/80 bg-zinc-950 px-6 py-14 text-center text-zinc-100 shadow-2xl sm:px-12 sm:py-20">
          {/* Grilla sutil decorativa */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[20px_20px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 -translate-x-1/2"
          >
            <div className="h-60 w-96 rounded-full bg-primary/25 blur-[100px]" />
          </div>

          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Comienza a analizar tu código ahora
            </h2>
            <p className="text-xs text-balance text-zinc-400 sm:text-sm md:text-base">
              Ahorra tiempo de depuración y obtén sugerencias de código con la máxima precisión técnica
              desde un entorno privado en tu propia máquina.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/chat"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-xs font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] hover:bg-primary/90"
              >
                <span className="icon-[lucide--bot] size-4" />
                <span>Abrir Entorno de Chat</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-6 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
              >
                <span className="icon-[lucide--terminal] size-4" />
                <span>Comandos de Instalación</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
