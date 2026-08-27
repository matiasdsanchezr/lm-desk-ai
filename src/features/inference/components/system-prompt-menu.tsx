"use client"

import {
  deleteSystemPrompt,
  getSystemPrompt,
  saveSystemPrompt,
} from "@/features/inference/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { useCopyToClipboard } from "@/shared/hooks/use-copy-to-clipboard"
import { cn } from "@/shared/lib/utils"
import { use, useState, useTransition } from "react"
import { useInferenceStore } from "../store/inference-store"
import { SystemPromptMeta } from "../types"

interface SystemPromptMenuProps {
  availablePromptsPromise: Promise<SystemPromptMeta[]>
}

export const SystemPromptMenu = ({
  availablePromptsPromise,
}: SystemPromptMenuProps) => {
  const availablePrompts = use(availablePromptsPromise)

  const { systemPrompt, setSystemPrompt, resetSystemPrompt } =
    useInferenceStore()

  const [draft, setDraft] = useState(systemPrompt)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"editor" | "templates">("editor")
  const [newTemplateName, setNewTemplateName] = useState("")
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const { isCopied, copy } = useCopyToClipboard()

  const handleOpenDialog = (open: boolean) => {
    if (open) {
      setDraft(systemPrompt)
    }
    setIsOpen(open)
  }

  const handleSelectTemplate = (promptId: string) => {
    startTransition(async () => {
      const result = await getSystemPrompt(promptId)
      if (result.data) {
        setDraft(result.data)
        setActiveTab("editor")
      }
    })
  }

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !draft.trim()) return

    startTransition(async () => {
      const cleanName = newTemplateName.trim().replace(/[^a-zA-Z0-9-_]/g, "_")
      const result = await saveSystemPrompt(cleanName, draft)
      if (!result.error) {
        setNewTemplateName("")
      }
    })
  }

  const handleConfirmDelete = () => {
    if (!templateToDelete) return

    startTransition(async () => {
      await deleteSystemPrompt(templateToDelete)
      setTemplateToDelete(null)
    })
  }

  const handleApplyChanges = () => {
    setSystemPrompt(draft)
    setIsOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="icon-[fa6-solid--terminal] size-3.5" />
          Instrucciones del sistema
        </label>
        {systemPrompt && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => copy(systemPrompt)}
            title="Copiar instrucciones"
          >
            <span
              className={cn(
                "size-3.5",
                isCopied
                  ? "icon-[fa6-solid--circle-check] text-emerald-500"
                  : "icon-[fa6-solid--copy]"
              )}
            />
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/20 p-3 sm:p-4">
        <p className="line-clamp-4 font-mono text-[11px] leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground sm:line-clamp-6">
          {systemPrompt || "No hay instrucciones configuradas."}
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenDialog}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-full justify-center border-dashed border-border/50 text-xs text-muted-foreground hover:text-foreground sm:h-9"
            >
              <span className="mr-2 icon-[fa6-solid--pen-to-square] size-3.5" />
              Editar Instrucciones
            </Button>
          }
        />
        <DialogContent className="flex h-[92dvh] w-[95vw] max-w-full flex-col border-border/40 bg-background p-4 sm:h-[85vh] sm:max-w-5xl sm:p-6">
          <DialogHeader className="shrink-0 text-left">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
              <span className="icon-[fa6-solid--sliders] size-4 text-muted-foreground" />
              Comportamiento del Sistema
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecciona una plantilla base, personaliza las instrucciones o
              guarda tu borrador.
            </DialogDescription>
          </DialogHeader>

          {/* Selector móvil */}
          <div className="mt-3 flex shrink-0 rounded-lg bg-muted/60 p-1 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("editor")}
              className={cn(
                "h-9 flex-1 rounded-md text-xs font-medium transition-all active:scale-95",
                activeTab === "editor"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="mr-1.5 icon-[fa6-solid--pen-to-square] size-3.5" />
              Editor
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("templates")}
              className={cn(
                "h-9 flex-1 rounded-md text-xs font-medium transition-all active:scale-95",
                activeTab === "templates"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="mr-1.5 icon-[fa6-solid--file-lines] size-3.5" />
              Plantillas ({availablePrompts.length})
            </Button>
          </div>

          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:flex-row">
            {/* Panel de plantillas */}
            <div
              className={cn(
                "min-h-0 w-full flex-col gap-3 overflow-y-auto border-border/40 md:w-72 md:border-r md:pr-4",
                activeTab === "templates" ? "flex flex-1" : "hidden md:flex"
              )}
            >
              <div className="flex min-h-0 flex-1 flex-col space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Plantillas disponibles
                </Label>
                <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                  {availablePrompts.length === 0 ? (
                    <p className="py-4 text-center text-[11px] italic text-muted-foreground">
                      No hay plantillas guardadas.
                    </p>
                  ) : (
                    availablePrompts.map((p) => (
                      <div
                        key={p.id}
                        className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                      >
                        <button
                          type="button"
                          className="mr-2 flex flex-1 items-center truncate text-left font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => handleSelectTemplate(p.id)}
                        >
                          <span className="mr-2 icon-[fa6-solid--file-lines] size-3.5 shrink-0 opacity-70" />
                          <span className="truncate">
                            {p.id.replace(".md", "")}
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTemplateToDelete(p.id)
                          }}
                          className="size-7 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar plantilla"
                        >
                          <span className="icon-[fa6-solid--trash-can] size-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="shrink-0 space-y-2 border-t border-border/40 pt-3">
                <Label
                  htmlFor="template-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Guardar borrador actual
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="template-name"
                    placeholder="Nombre..."
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="h-9 bg-muted/20 text-xs"
                    disabled={isPending}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={
                      isPending || !newTemplateName.trim() || !draft.trim()
                    }
                    className="h-9 shrink-0 px-3 text-xs"
                    variant="secondary"
                  >
                    <span className="mr-1 icon-[fa6-solid--floppy-disk] size-3" />
                    Guardar
                  </Button>
                </div>
              </div>
            </div>

            {/* Panel del editor */}
            <div
              className={cn(
                "min-h-0 flex-1 flex-col space-y-2",
                activeTab === "editor" ? "flex" : "hidden md:flex"
              )}
            >
              <Label
                htmlFor="prompt"
                className="shrink-0 text-xs font-medium text-muted-foreground"
              >
                Prompt del sistema
              </Label>
              <Textarea
                id="prompt"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-full min-h-48 flex-1 resize-none border-border/40 bg-muted/20 font-mono text-xs leading-relaxed text-foreground focus-visible:ring-1 focus-visible:ring-primary/40"
                placeholder="Escribe las instrucciones personalizadas aquí..."
              />
            </div>
          </div>

          <DialogFooter className="mt-3 shrink-0 flex-col-reverse gap-2 border-t border-border/40 pt-3 sm:flex-row sm:justify-between sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetSystemPrompt()
                setIsOpen(false)
              }}
              className="h-9 w-full text-xs text-muted-foreground hover:text-destructive sm:w-auto"
            >
              Restaurar por defecto
            </Button>
            <Button
              size="sm"
              onClick={handleApplyChanges}
              className="h-9 w-full px-6 text-xs font-medium sm:w-auto"
            >
              Aplicar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminación */}
      <AlertDialog
        open={templateToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setTemplateToDelete(null)
        }}
      >
        <AlertDialogContent className="w-[90vw] max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              ¿Eliminar plantilla?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Se eliminará permanentemente la plantilla{" "}
              <strong className="text-foreground">
                “{templateToDelete?.replace(".md", "")}”
              </strong>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <AlertDialogCancel disabled={isPending} className="h-9 text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isPending}
              className="h-9 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
