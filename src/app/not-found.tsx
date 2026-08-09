import Link from "next/link"

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground selection:bg-primary/10">
      {/* Cuadrícula decorativa y resplandor de fondo */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-75 w-125 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        {/* Badge de estado */}
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3.5 py-1 text-xs font-semibold text-destructive">
          <span className="icon-[lucide--alert-triangle] size-3.5" />
          <span>Error 404 · Ruta no encontrada</span>
        </div>

        {/* Mensaje principal */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            Recurso no indexado
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            La ruta o respuesta a la que intentas acceder no existe en el
            espacio de trabajo o fue movida.
          </p>
        </div>

        {/* Terminal simulada con estilo LM Desk */}
        <div className="w-full rounded-xl border border-zinc-200/80 bg-zinc-900/90 p-4 text-left font-mono text-xs shadow-2xl backdrop-blur-md dark:border-zinc-800/80">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] text-zinc-500">
              lm-desk --status check
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-zinc-300">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-primary">$</span>
              <span>resolve --path current_location</span>
            </div>
            <div className="font-semibold text-destructive">
              [ERROR] 404: Node standard reference unresolved.
            </div>
            <div className="text-[11px] text-zinc-500">
              &gt; Sugerencia: Revisa los parámetros en la URL o regresa al
              espacio de trabajo de análisis.
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/chat"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:bg-primary/90"
          >
            <span className="icon-[lucide--bot] size-4" />
            Ir a una nueva sesión
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span className="icon-[lucide--home] size-4" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
