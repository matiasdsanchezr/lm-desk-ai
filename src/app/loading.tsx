export default function Loading() {
  return (
    <main
      role="status"
      aria-label="Cargando contenido..."
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground selection:bg-primary/10"
    >
      {/* Cuadrícula decorativa de fondo (coherente con Home/About/404) */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />

      {/* Glow de neón ambiental con pulso sutil */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-75 w-125 animate-pulse rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center">
        {/* Contenedor del Icono Principal con efecto de carga circular */}
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-card/60 shadow-xl backdrop-blur-md">
          <span className="icon-[lucide--bot] size-8 text-primary" />
          <span className="absolute -inset-1 animate-spin rounded-2xl border border-primary/40 border-t-transparent border-l-transparent" />
        </div>

        {/* Indicador de estado estilo CLI / LM Desk */}
        <div className="w-full space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 font-mono text-xs text-muted-foreground backdrop-blur-xs">
            <span className="icon-[lucide--loader-2] size-3.5 animate-spin text-primary" />
            <span>Inicializando workspace...</span>
          </div>

          {/* Skeleton de contenido simulado */}
          <div className="w-full space-y-2 rounded-xl border border-border/40 bg-card/30 p-4 backdrop-blur-xs">
            <div className="h-3 w-3/4 animate-pulse rounded-md bg-muted/80" />
            <div className="h-3 w-full animate-pulse rounded-md bg-muted/50" />
            <div className="h-3 w-5/6 animate-pulse rounded-md bg-muted/30" />
          </div>
        </div>
      </div>
    </main>
  )
}
