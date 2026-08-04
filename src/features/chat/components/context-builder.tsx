"use client"

import {
  FileExplorerModal,
  useFileExplorerStore,
  type FileTreeNode,
} from "@/features/file-explorer"
import { useFileExplorerContext } from "@/features/file-explorer/context/file-explorer-context"
import { useSettingsStore } from "@/features/inference-settings/store/settings-store"
import {
  MentionOption,
  TextEditor,
} from "@/shared/components/text-editor/text-editor"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"
import { useMemo, useState } from "react"
import { useShallow } from "zustand/shallow"
import { ImageUploadDialog } from "../../chat/components/image-upload-dialog"
import { useChatActions, useChatStore } from "../../chat/store/chat-store"

interface ContextBuilderProps {
  isDisabled: boolean
  isFetchingFiles: boolean
  isReadyToReview: boolean
  fetchFileState?: { error: string | null }
  handleFetchFileContents: (formData: FormData) => void
}

export const ContextBuilder = ({
  isDisabled,
  isFetchingFiles,
  isReadyToReview,
  fetchFileState,
  handleFetchFileContents,
}: ContextBuilderProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const { treeNodes } = useFileExplorerContext()

  const userTask = useChatStore((s) => s.userTask)
  const { setUserTask } = useChatActions()
  const systemPrompt = useSettingsStore((s) => s.systemPrompt)

  const {
    selectedFiles,
    imageUrls,
    includeDependencies,
    fileContents,
    setSelectedFiles,
  } = useFileExplorerStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      imageUrls: s.imageUrls,
      includeDependencies: s.includeDependencies,
      fileContents: s.fileContents,
      setSelectedFiles: s.setSelectedFiles,
    }))
  )

  const imageUrlCount = useMemo(() => {
    return imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean).length
  }, [imageUrls])

  const fileErrors = useMemo(
    () =>
      fileContents
        .filter((file) => file.error)
        .map((file) => `${file.path}: ${file.error}`),
    [fileContents]
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
          <div className="flex flex-wrap items-center gap-3">
            <FileExplorerModal disabled={isDisabled} />

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

      <ImageUploadDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        disabled={isDisabled}
      />
    </>
  )
}
