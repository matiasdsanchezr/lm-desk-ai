// src/features/chat/components/chat-workspace-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatWorkspaceSkeletonProps {
  /** Si es true, renderiza también el esqueleto del hilo de mensajes (/chat/[chatId]) */
  isThreadView?: boolean
}

export function ChatWorkspaceSkeleton({
  isThreadView = false,
}: ChatWorkspaceSkeletonProps) {
  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Paso 1: Context Builder Skeleton */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Botones de acción (Explorador y Adjuntos) */}
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-44 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>

          {/* Editor de texto de la consulta */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex justify-between items-center px-1">
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>

          {/* Botón enviar / generar */}
          {!isThreadView && <Skeleton className="h-10 w-56 rounded-md mt-1" />}
        </CardContent>
      </Card>

      {/* Historial / Hilo de conversación (para /chat/[chatId]) */}
      {isThreadView && (
        <Card className="overflow-hidden border-border/60 shadow-md">
          {/* Cabecera del hilo */}
          <CardHeader className="border-b bg-muted/30 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>

          {/* Turnos de mensajes de ejemplo */}
          <CardContent className="p-0 divide-y divide-border/40">
            {/* Turno 1 */}
            <div className="p-4 md:p-6 space-y-4 bg-background/50">
              {/* Bloque consulta del usuario */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Respuesta del asistente */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-16" />
                </div>

                {/* Bloque de razonamiento (Reasoning skeleton) */}
                <div className="rounded-lg border border-border/40 bg-muted/10 p-3 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3.5 w-5/6" />
                </div>

                {/* Contenido de respuesta */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </div>
            </div>

            {/* Turno 2 (Skeleton más ligero) */}
            <div className="p-4 md:p-6 space-y-4">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[78%]" />
              </div>
            </div>

            {/* Caja de seguimiento (Follow-up) */}
            <div className="border-t border-border/60 bg-muted/10 p-4 sm:p-5 space-y-3">
              <Skeleton className="h-4 w-72 rounded" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Skeleton className="h-16 flex-1 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
