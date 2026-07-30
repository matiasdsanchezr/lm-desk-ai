"use client"

import { MentionOption, TextEditor } from "@/components/text-editor/text-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { FileExplorerView } from "@/features/file-explorer/components/file-explorer-view"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import type { FileTreeNode } from "@/features/file-explorer/types/file-tree-node"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { useShallow } from "zustand/shallow"

interface ContextBuilderProps {
  fetchFileState?: { error: string | null }
  fileErrors: string[]
  isReadyToReview: boolean
  isDisabled: boolean
  isFetchingFiles: boolean
  showFileExplorer: boolean
  treeNodes: FileTreeNode[]
  totalFiles: number
  systemPrompt: string
  handleFetchFileContents: (formData: FormData) => void
  setShowFileExplorer: (show: boolean) => void
}

export const ContextBuilder = ({
  treeNodes,
  totalFiles,
  systemPrompt,
  isDisabled,
  isFetchingFiles,
  showFileExplorer,
  setShowFileExplorer,
  fileErrors,
  fetchFileState,
  handleFetchFileContents,
  isReadyToReview,
}: ContextBuilderProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const userTask = useChatStore((s) => s.userTask)
  const { setUserTask } = useChatActions()

  const {
    selectedFiles,
    imageUrls,
    includeDependencies,
    setImageUrls,
    setSelectedFiles,
    setIncludeDependencies,
  } = useFileExplorerStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      imageUrls: s.imageUrls,
      includeDependencies: s.includeDependencies,
      setImageUrls: s.setImageUrls,
      setSelectedFiles: s.setSelectedFiles,
      setIncludeDependencies: s.setIncludeDependencies,
    }))
  )

  const imageUrlCount = useMemo(() => {
    return imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean).length
  }, [imageUrls])

  const mentionOptions = useMemo(() => {
    const options: MentionOption[] = []
    const traverse = (node: FileTreeNode) => {
      if (node.isFile && node.filePath) {
        options.push({
          id: node.filePath,
          label: node.name,
          description: node.filePath,
        })
      }
      node.children?.forEach(traverse)
    }
    treeNodes.forEach(traverse)
    return options
  }, [treeNodes])

  const handleFormAction = (formData: FormData) => {
    formData.append("includeDependencies", String(includeDependencies))
    formData.append("imageUrls", imageUrls)
    formData.append("systemPrompt", systemPrompt)
    selectedFiles.forEach((path) => formData.append("filePath", path))

    handleFetchFileContents(formData)
  }

  return (
    <>
      <Card
        className={cn(
          "border-border/60 shadow-sm transition-colors",
          isReadyToReview && "bg-muted/40"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <span>Paso 1</span>
              </div>
              <CardTitle className="text-lg md:text-xl">
                Define tu consulta
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Selecciona los archivos y describe la tarea que deseas realizar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Botones de acción agrupados juntos */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => setShowFileExplorer(true)}
              variant="outline"
              size="sm"
              disabled={isDisabled}
              className="inline-flex items-center gap-2"
            >
              <span className="icon-[fa7-solid--folder-open]" />
              <span>Explorador de archivos</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {selectedFiles.length}
              </span>
            </Button>

            <Button
              type="button"
              onClick={() => setShowImageDialog(true)}
              variant="outline"
              size="sm"
              disabled={isDisabled}
              className="inline-flex items-center gap-2"
            >
              <span className="icon-[fa7-solid--images]" />
              <span>Cargar Imágenes (URLs)</span>
              {imageUrlCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {imageUrlCount}
                </span>
              )}
            </Button>

            {(selectedFiles.length > 0 || imageUrlCount > 0) && (
              <span className="text-xs text-muted-foreground">
                {selectedFiles.length} archivo(s)
                {imageUrlCount > 0 ? `, ${imageUrlCount} imagen(es)` : ""}
              </span>
            )}
          </div>

          {fileErrors.length > 0 && (
            <Alert
              variant="destructive"
              className="border-destructive/40 bg-destructive/5"
            >
              <AlertDescription className="space-y-1 text-sm">
                <p className="font-medium">
                  No se pudieron leer {fileErrors.length} archivo(s).
                </p>
                <p>
                  Revisa la selección o intenta de nuevo. Si el problema
                  persiste, verifica permisos de lectura o formato.
                </p>
                <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                  {fileErrors.slice(0, 3).map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                  {fileErrors.length > 3 && (
                    <li>Y {fileErrors.length - 3} archivo(s) más…</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {fetchFileState?.error && (
            <Alert
              variant="destructive"
              className="border-destructive/40 bg-destructive/5"
            >
              <AlertDescription className="text-sm font-medium">
                {fetchFileState.error}
              </AlertDescription>
            </Alert>
          )}

          <form action={handleFormAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <TextEditor
                value={userTask}
                onChange={setUserTask}
                placeholder="Ej: Explícame qué hace esta función."
                className="min-h-32 text-sm md:text-base"
                disabled={isDisabled}
                mentionOptions={mentionOptions}
                onMentionSelect={(filePath) => {
                  if (!selectedFiles.includes(filePath)) {
                    setSelectedFiles([...selectedFiles, filePath])
                  }
                }}
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{userTask.trim().length} caracteres</span>
              </div>
            </div>

            {!isReadyToReview && (
              <Button
                type="submit"
                disabled={!userTask.trim() || isFetchingFiles}
                className="inline-flex max-w-60 items-center gap-2"
              >
                {isFetchingFiles ? (
                  <>
                    <span className="icon-[fa7-solid--spinner] animate-spin" />
                    Analizando archivos...
                  </>
                ) : (
                  <>
                    <span className="icon-[fa7-solid--paper-plane]" />
                    Generar y revisar prompt
                  </>
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Modal Dialog para el Explorador de Archivos */}
      <Dialog open={showFileExplorer} onOpenChange={setShowFileExplorer}>
        <DialogContent className="flex max-h-[90vh] h-[90vh] max-w-[95vw] w-full flex-col gap-0 p-0 sm:max-w-6xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="icon-[fa7-solid--folder-open] text-primary" />
              Explorador del Proyecto
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Selecciona los archivos del proyecto que se incluirán como
              contexto en la consulta.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-3 min-h-0 overflow-hidden p-4 sm:p-6">
            <div className="flex-1 min-h-0">
              <FileExplorerView
                treeNodes={treeNodes}
                totalFiles={totalFiles}
                disabled={isDisabled}
                selectedFiles={selectedFiles}
                onSelectionChange={setSelectedFiles}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="include-deps"
                checked={includeDependencies}
                onCheckedChange={(val) => setIncludeDependencies(!!val)}
                disabled={isDisabled}
              />
              <Label
                htmlFor="include-deps"
                className="cursor-pointer text-xs sm:text-sm"
              >
                Incluir dependencias de los archivos seleccionados
              </Label>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/20 px-6 py-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {selectedFiles.length} archivo(s) seleccionado(s)
              </span>
              <Button onClick={() => setShowFileExplorer(false)} size="sm">
                Confirmar selección
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog para Carga de Imágenes por URL */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="icon-[fa7-solid--images] text-primary" />
              Cargar Imágenes (URLs)
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Pega las URLs de las imágenes que deseas adjuntar como contexto
              visual para el modelo (una por línea).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Label
              htmlFor="imageUrls-dialog"
              className="text-xs font-medium text-muted-foreground"
            >
              URLs de las imágenes
            </Label>
            <Textarea
              id="imageUrls-dialog"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder={`https://ejemplo.com/captura1.png\nhttps://ejemplo.com/captura2.png`}
              className="min-h-36 font-mono text-xs"
              disabled={isDisabled}
            />
            <p className="text-[11px] text-muted-foreground">
              Estas imágenes se descargarán y enviarán como adjuntos visuales al
              modelo.
            </p>
          </div>

          <DialogFooter className="border-t pt-3">
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {imageUrlCount} URL(s) ingresada(s)
              </span>
              <Button onClick={() => setShowImageDialog(false)} size="sm">
                Guardar y cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
