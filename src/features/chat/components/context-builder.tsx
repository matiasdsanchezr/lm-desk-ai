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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useChatActions, useChatStore } from "@/features/chat/store/chat-store"
import { FileExplorerView } from "@/features/file-explorer/components/file-explorer-view"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import type { FileTreeNode } from "@/features/file-explorer/types/file-tree-node"
import { cn } from "@/lib/utils"
import { useMemo } from "react"
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
  const userQuery = useChatStore((s) => s.userQuery)
  const { setUserQuery } = useChatActions()

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
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            variant="outline"
            size="sm"
            disabled={isDisabled}
            className="inline-flex items-center gap-2"
          >
            <span
              className={cn(
                "icon-[fa7-solid--folder-open] transition-transform",
                showFileExplorer && "rotate-12"
              )}
            />
            <span className="hidden sm:inline">
              {showFileExplorer
                ? "Ocultar explorador de archivos"
                : "Mostrar explorador de archivos"}
            </span>
            <span className="sm:hidden">
              {showFileExplorer ? "Ocultar archivos" : "Ver archivos"}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {selectedFiles.length}
            </span>
          </Button>

          {selectedFiles.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </span>
          )}
        </div>

        {showFileExplorer && (
          <FileExplorerView
            treeNodes={treeNodes}
            totalFiles={totalFiles}
            disabled={isDisabled}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
          />
        )}

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
                Revisa la selección o intenta de nuevo. Si el problema persiste,
                verifica permisos de lectura o formato.
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
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id="include-deps"
              checked={includeDependencies}
              onCheckedChange={(val) => setIncludeDependencies(!!val)}
              disabled={isDisabled}
            />
            <Label htmlFor="include-deps" className="cursor-pointer">
              Incluir dependencias de los archivos seleccionados
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="imageUrls"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <span className="icon-[fa7-solid--images] text-muted-foreground" />
              Cargar Imágenes (URLs)
            </Label>
            <Textarea
              id="imageUrls"
              name="imageUrls"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder={`https://ejemplo.com/captura1.png\nhttps://ejemplo.com/captura2.png`}
              className="min-h-20 font-mono text-xs"
              disabled={isDisabled}
            />
            <p className="text-[10px] text-muted-foreground">
              Pega una URL por línea. Estas imágenes se enviarán como contexto
              visual al modelo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <TextEditor
              value={userQuery}
              onChange={setUserQuery}
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
              <span>
                Selecciona al menos un archivo para generar el prompt.
              </span>
              <span>{userQuery.trim().length} caracteres</span>
            </div>
          </div>

          {!isReadyToReview && (
            <Button
              type="submit"
              disabled={!userQuery.trim() || isFetchingFiles}
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
  )
}
