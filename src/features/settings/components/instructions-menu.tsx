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
import {
  deletePrompt,
  loadPrompt,
  savePrompt,
} from "@/features/settings/actions"
import { cn } from "@/shared/lib/utils"
import { useState, useTransition } from "react"
import { useSettingsStore } from "../store/settings-store"

interface Props {
  availablePrompts: string[]
}

export const InstructionsMenu = ({ availablePrompts }: Props) => {
  const { systemPrompt, setSystemPrompt, resetSystemPrompt } =
    useSettingsStore()
  const [draft, setDraft] = useState(systemPrompt)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"editor" | "templates">("editor")
  const [promptsList, setPromptsList] = useState<string[]>(availablePrompts)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [prevAvailablePrompts, setPrevAvailablePrompts] =
    useState(availablePrompts)

  if (availablePrompts !== prevAvailablePrompts) {
    setPrevAvailablePrompts(availablePrompts)
    setPromptsList(availablePrompts)
  }

  const handleSelectTemplate = (promptId: string) => {
    startTransition(async () => {
      try {
        const result = await loadPrompt(promptId)
        if (result.data) {
          setDraft(result.data)
          setActiveTab("editor")
        }
      } catch (error) {
        console.error("Error al cargar la plantilla:", error)
      }
    })
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !draft.trim()) return
    setIsSaving(true)
    try {
      const cleanName = newTemplateName.trim().replace(/[^a-zA-Z0-9-_]/g, "_")
      const result = await savePrompt(cleanName, draft)

      if (result.error) {
        return
      }

      if (result.data && !promptsList.includes(result.data.fileName)) {
        setPromptsList((prev) => [...prev, result.data!.fileName])
      }

      setNewTemplateName("")
    } catch (error) {
      console.error("Error al guardar la plantilla:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTemplateToDelete(promptId)
  }

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return
    setIsDeleting(true)
    try {
      const result = await deletePrompt(templateToDelete)
      if (result.error) {
        alert(result.error)
        return
      }
      setPromptsList((prev) => prev.filter((p) => p !== templateToDelete))
    } catch (error) {
      console.error("Error al eliminar la plantilla:", error)
    } finally {
      setIsDeleting(false)
      setTemplateToDelete(null)
    }
  }

  const handleSave = () => {
    setSystemPrompt(draft)
    setIsOpen(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(systemPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="icon-[fa6-solid--terminal] h-3.5 w-3.5" />
          Instrucciones del sistema
        </label>
        {systemPrompt && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Copiar instrucciones"
          >
            <span
              className={
                copied
                  ? "icon-[fa6-solid--circle-check] h-3.5 w-3.5 text-foreground"
                  : "icon-[fa6-solid--copy] h-3.5 w-3.5"
              }
            />
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/20 p-3 sm:p-4">
        <p className="line-clamp-4 font-mono text-[11px] leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground sm:line-clamp-6">
          {systemPrompt || "No hay instrucciones configuradas."}
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="h-10 w-full justify-center border-dashed border-border/50 text-xs text-muted-foreground hover:text-foreground sm:h-9"
            >
              <span className="mr-2 icon-[fa6-solid--pen-to-square] h-3.5 w-3.5" />
              Editar Instrucciones
            </Button>
          }
        />
        <DialogContent className="flex h-[92dvh] w-[95vw] max-w-full flex-col border-border/40 bg-background p-4 sm:h-[85vh] sm:max-w-5xl sm:p-6">
          <DialogHeader className="shrink-0 text-left">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
              <span className="icon-[fa6-solid--sliders] h-4 w-4 text-muted-foreground" />
              Comportamiento del Sistema
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecciona una plantilla base, personaliza las instrucciones o
              guarda tu borrador.
            </DialogDescription>
          </DialogHeader>

          {/* Selector de Pestañas táctil para Móviles */}
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
              <span className="mr-1.5 icon-[fa6-solid--pen-to-square] h-3.5 w-3.5" />
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
              <span className="mr-1.5 icon-[fa6-solid--file-lines] h-3.5 w-3.5" />
              Plantillas ({promptsList.length})
            </Button>
          </div>

          {/* Contenedor adaptativo de dos paneles */}
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
                  {promptsList.length === 0 ? (
                    <p className="py-4 text-center text-[11px] italic text-muted-foreground">
                      No hay plantillas guardadas.
                    </p>
                  ) : (
                    promptsList.map((p) => (
                      <div
                        key={p}
                        className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                      >
                        <button
                          type="button"
                          className="mr-2 flex flex-1 items-center truncate text-left font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => handleSelectTemplate(p)}
                        >
                          <span className="mr-2 icon-[fa6-solid--file-lines] h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span className="truncate">
                            {p.replace(".md", "")}
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(p, e)}
                          className="h-7 w-7 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar plantilla"
                        >
                          <span className="icon-[fa6-solid--trash-can] h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-border/40 pt-3 shrink-0">
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
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={
                      isSaving || !newTemplateName.trim() || !draft.trim()
                    }
                    className="h-9 shrink-0 px-3 text-xs"
                    variant="secondary"
                  >
                    <span className="mr-1 icon-[fa6-solid--floppy-disk] h-3 w-3" />
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
              onClick={handleSave}
              className="h-9 w-full px-6 text-xs font-medium sm:w-auto"
            >
              Aplicar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación para eliminación */}
      <AlertDialog
        open={templateToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setTemplateToDelete(null)
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
            <AlertDialogCancel disabled={isDeleting} className="h-9 text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isDeleting}
              className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
