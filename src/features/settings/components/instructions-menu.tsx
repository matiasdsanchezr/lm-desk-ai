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
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  deletePrompt,
  loadPrompt,
  savePrompt,
} from "@/features/settings/actions/prompt"
import { cn } from "@/lib/utils"
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

  // Estado para controlar la pestaña activa en dispositivos móviles
  const [activeTab, setActiveTab] = useState<"editor" | "templates">("editor")

  // Estado local para manejo ágil de plantillas en UI
  const [promptsList, setPromptsList] = useState<string[]>(availablePrompts)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Estado para controlar qué plantilla se va a eliminar en el AlertDialog
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sincronizar estado local cuando el servidor actualiza las props
  const [prevAvailablePrompts, setPrevAvailablePrompts] =
    useState(availablePrompts)
  if (availablePrompts !== prevAvailablePrompts) {
    setPrevAvailablePrompts(availablePrompts)
    setPromptsList(availablePrompts)
  }

  const handleSelectTemplate = (promptId: string) => {
    startTransition(async () => {
      try {
        const content = await loadPrompt(promptId)
        setDraft(content)
        // Cambiar automáticamente a la pestaña del editor en móvil al seleccionar
        setActiveTab("editor")
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
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
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

      <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
        <p className="line-clamp-6 font-mono text-[11px] leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
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
              className="w-full justify-center border-dashed border-border/50 text-muted-foreground hover:text-foreground"
            >
              <span className="mr-2 icon-[fa6-solid--pen-to-square] h-3.5 w-3.5" />
              Editar Instrucciones
            </Button>
          }
        />
        <DialogContent className="flex h-full max-h-[90vh] w-full flex-col border-border/40 bg-background p-4 sm:max-h-[85vh] sm:max-w-6xl">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-sm font-medium tracking-tight">
              <span className="icon-[fa6-solid--sliders] h-4 w-4 text-muted-foreground" />
              Comportamiento del Sistema
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecciona una plantilla base, personaliza las instrucciones del
              agente o guarda tu borrador.
            </DialogDescription>
          </DialogHeader>

          {/* Selector de Pestañas para Móviles */}
          <div className="mt-3 flex shrink-0 gap-1 rounded-lg bg-muted/50 p-1 md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("editor")}
              className={cn(
                "h-auto flex-1 rounded-md py-1.5 text-xs transition-all",
                activeTab === "editor"
                  ? "bg-background font-medium text-foreground shadow-xs"
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
                "h-auto flex-1 rounded-md py-1.5 text-xs transition-all",
                activeTab === "templates"
                  ? "bg-background font-medium text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="mr-1.5 icon-[fa6-solid--file-lines] h-3.5 w-3.5" />
              Plantillas ({promptsList.length})
            </Button>
          </div>

          {/* Contenedor principal con scroll vertical habilitado para móviles */}
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto md:flex-row md:overflow-hidden">
            {/* Panel izquierdo: Gestión de plantillas */}
            <div
              className={cn(
                "w-full shrink-0 flex-col gap-4 border-b border-border/40 pb-4 md:w-80 md:border-r md:border-b-0 md:pr-4 md:pb-0",
                activeTab === "templates" ? "flex" : "hidden md:flex"
              )}
            >
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Plantillas disponibles
                </Label>
                <div className="flex max-h-45 flex-col gap-1.5 overflow-y-auto pr-1 md:max-h-75">
                  {promptsList.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">
                      No hay plantillas guardadas.
                    </p>
                  ) : (
                    promptsList.map((p) => (
                      <div
                        key={p}
                        className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/60"
                      >
                        <button
                          type="button"
                          className="mr-2 flex flex-1 items-center truncate text-left font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => handleSelectTemplate(p)}
                        >
                          <span className="mr-2 icon-[fa6-solid--file-lines] h-3 w-3 shrink-0 opacity-70" />
                          <span className="truncate">
                            {p.replace(".md", "")}
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(p, e)}
                          className="h-5 w-5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar plantilla"
                        >
                          <span className="icon-[fa6-solid--trash-can] h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-border/40 pt-2">
                <Label
                  htmlFor="template-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Guardar borrador actual como plantilla
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="template-name"
                    placeholder="Nombre plantilla..."
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="h-8 bg-muted/20 text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={
                      isSaving || !newTemplateName.trim() || !draft.trim()
                    }
                    className="h-8 px-2.5 text-xs"
                    variant="secondary"
                  >
                    <span className="mr-1.5 icon-[fa6-solid--floppy-disk] h-3 w-3" />
                    Guardar
                  </Button>
                </div>
              </div>
            </div>

            {/* Panel derecho: Editor de texto principal */}
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
                className="min-h-50 flex-1 resize-none border-border/40 bg-muted/20 font-mono text-xs leading-relaxed text-foreground focus-visible:ring-1 focus-visible:ring-primary/40 md:min-h-75"
                placeholder="Escribe las instrucciones personalizadas aquí..."
              />
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0 flex-col gap-2 border-t border-border/40 pt-3 sm:flex-row sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                resetSystemPrompt()
                setIsOpen(false)
              }}
              className="w-full text-xs text-muted-foreground hover:text-destructive sm:w-auto"
            >
              Restaurar valores por defecto
            </Button>
            <Button
              onClick={handleSave}
              className="w-full px-6 text-xs font-medium sm:w-auto"
            >
              Aplicar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de ShadCN para confirmaciones de eliminación */}
      <AlertDialog
        open={templateToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setTemplateToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la plantilla{" "}
              <strong className="text-foreground">
                “{templateToDelete?.replace(".md", "")}”
              </strong>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isDeleting}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
