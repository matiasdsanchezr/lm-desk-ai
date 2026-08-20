"use client"

import { fetchFileContextAction } from "@/features/file-explorer/actions/fetch-file-context"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useInferenceStore } from "@/features/inference/store/inference-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import { useCallback, useState } from "react"
import { useChatStore } from "../store/chat-store"

interface ProcessResult {
  contextualPrompt: string
  exportablePrompt: string
  error: string | null
}

export function useContextProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Compila el contexto de archivos, webs e imágenes junto con la tarea del usuario.
   * Preserva intactas las imágenes del store (pegadas o importadas por URL).
   */
  const compileContext = useCallback(
    async (customTask?: string): Promise<ProcessResult> => {
      setIsProcessing(true)
      setError(null)

      try {
        const { userTask, includeContext, actions } = useChatStore.getState()
        const {
          selectedFilePaths,
          includeDependencies,
          setFileContents,
          addImageFiles,
        } = useFileExplorerStore.getState()
        const { crawledPages, selectedUrls } = useWebCrawlerStore.getState()
        const systemPrompt = useInferenceStore.getState().systemPrompt

        const taskToProcess = customTask !== undefined ? customTask : userTask

        const formData = new FormData()
        formData.append("includeDependencies", String(includeDependencies))
        formData.append("systemPrompt", systemPrompt)

        if (includeContext) {
          selectedFilePaths.forEach((path) => formData.append("filePath", path))
        }

        const { data, error: actionError } = await fetchFileContextAction(
          {},
          formData
        )

        if (actionError || !data) {
          const errMessage =
            actionError ?? "Se produjo un error al analizar los archivos"
          setError(errMessage)
          return {
            contextualPrompt: "",
            exportablePrompt: "",
            error: errMessage,
          }
        }

        // 1. Fuentes Web seleccionadas
        const selectedWebPages = includeContext
          ? crawledPages.filter(
              (page) => selectedUrls.includes(page.url) && page.content
            )
          : []

        const formattedWebSources = selectedWebPages.map((page) => ({
          path: `[Web] ${page.title || page.url} (${page.url})`,
          content: page.content ?? "",
        }))

        // 2. Archivos Locales
        const localFiles = includeContext ? (data.fileContents ?? []) : []
        const combinedContextFiles = [...localFiles, ...formattedWebSources]

        // 3. Construcción del Prompt
        const promptBuilder = new PromptBuilder()
          .addSystem(systemPrompt)
          .addContext(combinedContextFiles)
          .addTask(taskToProcess)

        const contextualPrompt = promptBuilder.buildContextAndTask()
        const exportablePrompt = promptBuilder.build()

        setFileContents(includeContext ? (data.fileContents ?? []) : [])

        if (includeContext && data.imageFiles && data.imageFiles.length > 0) {
          addImageFiles(data.imageFiles)
        }

        actions.setPrompts({
          contextualPrompt,
          exportablePrompt,
        })

        return { contextualPrompt, exportablePrompt, error: null }
      } catch (err) {
        const errMessage =
          err instanceof Error
            ? err.message
            : "Error inesperado al compilar el contexto"
        setError(errMessage)
        return { contextualPrompt: "", exportablePrompt: "", error: errMessage }
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  return {
    compileContext,
    isProcessingContext: isProcessing,
    contextProcessError: error,
  }
}
