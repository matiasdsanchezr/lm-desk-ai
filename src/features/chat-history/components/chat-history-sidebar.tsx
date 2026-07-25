"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useState, useTransition } from "react"
import { deleteChat } from "../actions/chat-history-actions"
import type { SavedResponseMeta } from "../services/chat-history-service"

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatResponseDate(dateValue: Date | string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Fecha desconocida"
  return dateFormatter.format(date)
}

interface ChatHistorySidebarProps {
  responses: SavedResponseMeta[]
}

export function ChatHistorySidebar({ responses }: ChatHistorySidebarProps) {
  const router = useRouter()
  const params = useParams()
  const currentId = params?.responseId as string | undefined

  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [idToDeleteConfirm, setIdToDeleteConfirm] = useState<string | null>(
    null
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const responseToDelete = useMemo(
    () => responses.find((response) => response.id === idToDeleteConfirm),
    [idToDeleteConfirm, responses]
  )

  const handleSelect = useCallback(
    (id: string) => {
      if (id === currentId || deletingId) return
      router.push(`/chat/${id}`)
    },
    [currentId, deletingId, router]
  )

  const handleNewChat = useCallback(() => {
    setDeleteError(null)
    router.push("/chat")
  }, [router])

  const requestDelete = useCallback((id: string) => {
    setDeleteError(null)
    setIdToDeleteConfirm(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!idToDeleteConfirm || isPending) return

    const id = idToDeleteConfirm
    setDeletingId(id)
    setIdToDeleteConfirm(null)
    setDeleteError(null)

    startTransition(async () => {
      const result = await deleteChat(id)

      if (result.error) {
        setDeleteError(result.error)
        setDeletingId(null)
        return
      }

      // Si el chat eliminado es el activo, redirigir a nuevo chat
      if (currentId === id) {
        router.replace("/chat")
      }
      router.refresh()
      setDeletingId(null)
    })
  }, [currentId, idToDeleteConfirm, isPending, router, startTransition])

  return (
    <>
      <Sidebar
        collapsible="icon"
        className={cn(
          "h-full shrink-0 border-r border-zinc-200/50 bg-zinc-50/50 transition-all duration-300 dark:border-zinc-800/50 dark:bg-zinc-950/20",
          isCollapsed ? "w-12" : "w-full md:w-80"
        )}
      >
        <SidebarHeader
          className={cn(
            "border-b border-zinc-200/50 dark:border-zinc-800/50",
            isCollapsed ? "p-2" : "px-3 py-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "flex-col justify-center" : "justify-between"
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="icon-[lucide--history] size-4 text-primary" />
                <span>Historial</span>
              </div>
            )}

            <div
              className={cn(
                "flex items-center gap-1.5",
                isCollapsed && "flex-col"
              )}
            >
              <button
                type="button"
                onClick={handleNewChat}
                title="Nuevo análisis"
                className={cn(
                  "inline-flex items-center justify-center gap-1 rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20",
                  isCollapsed ? "size-8" : "px-2.5 py-1.5 text-xs font-medium"
                )}
              >
                <span className="icon-[lucide--plus] size-4" />
                {!isCollapsed && <span>Nuevo</span>}
              </button>

              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span
                  className={cn(
                    isCollapsed
                      ? "icon-[lucide--panel-left-open]"
                      : "icon-[lucide--panel-left-close]",
                    "size-4"
                  )}
                />
              </button>
            </div>
          </div>
        </SidebarHeader>

        {!isCollapsed && (
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupContent>
                {deleteError && (
                  <div
                    role="alert"
                    className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    {deleteError}
                  </div>
                )}

                {responses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                    <span className="mb-2 icon-[lucide--archive-x] size-8 opacity-40" />
                    <span>No hay análisis guardados</span>
                  </div>
                ) : (
                  <SidebarMenu className="gap-1.5">
                    {responses.map((response) => {
                      const isActive = currentId === response.id
                      const isDeleting = deletingId === response.id
                      const formattedDate = formatResponseDate(
                        response.createdAt
                      )

                      return (
                        <SidebarMenuItem
                          key={response.id}
                          className="group/menu-item relative"
                        >
                          <SidebarMenuButton
                            isActive={isActive}
                            className={cn(
                              "h-auto w-full cursor-pointer rounded-lg border text-left transition-colors hover:bg-muted/50",
                              isActive
                                ? "border-primary/30 bg-muted"
                                : "border-zinc-200/40 bg-background/50 dark:border-zinc-800/40"
                            )}
                            render={
                              <button
                                type="button"
                                onClick={() => handleSelect(response.id)}
                                disabled={isDeleting}
                                className="flex w-full flex-col items-start gap-1 p-3 pr-9 disabled:opacity-60"
                              >
                                <span className="line-clamp-2 w-full text-xs font-medium text-foreground">
                                  {response.title || "Análisis sin título"}
                                </span>

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <span className="icon-[lucide--calendar] size-3" />
                                  <time
                                    suppressHydrationWarning
                                    dateTime={new Date(
                                      response.createdAt
                                    ).toISOString()}
                                  >
                                    {formattedDate}
                                  </time>
                                </div>
                              </button>
                            }
                          />

                          <SidebarMenuAction
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              requestDelete(response.id)
                            }}
                            disabled={isPending || isDeleting}
                            showOnHover
                            className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            {isDeleting ? (
                              <span className="icon-[lucide--loader-2] size-3.5 animate-spin" />
                            ) : (
                              <span className="icon-[lucide--trash-2] size-3.5" />
                            )}
                          </SidebarMenuAction>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
      </Sidebar>

      <AlertDialog
        open={idToDeleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setIdToDeleteConfirm(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este análisis?</AlertDialogTitle>
            <AlertDialogDescription>
              {responseToDelete?.title ? (
                <>
                  Se eliminará permanentemente{" "}
                  <strong>“{responseToDelete.title}”</strong>.
                </>
              ) : (
                "Esta acción no se puede deshacer."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
