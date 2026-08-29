"use client"

import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useInferenceStore } from "@/features/inference/store/inference-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import { useCallback, useState } from "react"
import { compileContextAction } from "../actions/compile-context-action"
import { useChatStore } from "../store/chat-store"

export function useContextProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compileContext = useCallback(async (customTask?: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const { userTask, includeContext, setPrompts } = useChatStore.getState()
      const { selectedFilePaths, includeDependencies } =
        useFileExplorerStore.getState()
      const { crawledPages, selectedUrls } = useWebCrawlerStore.getState()
      const systemPrompt = useInferenceStore.getState().systemPrompt

      const task = customTask ?? userTask

      const selectedWebPages = includeContext
        ? crawledPages.filter(
            (page) => selectedUrls.includes(page.url) && page.content
          )
        : []

      const webSources = selectedWebPages.map((page) => ({
        path: `[Web] ${page.title || page.url} (${page.url})`,
        content: page.content ?? "",
      }))

      const result = await compileContextAction({
        task,
        systemPrompt,
        includeContext,
        includeDependencies,
        selectedFilePaths: includeContext ? selectedFilePaths : [],
        webSources,
      })

      if (result.error || !result.data) {
        setError(result.error ?? "Error al compilar contexto")
        return {
          contextualPrompt: "",
          exportablePrompt: "",
          files: [],
          error: result.error ?? "Error al compilar contexto",
        }
      }

      const fileStore = useFileExplorerStore.getState()
      fileStore.setFileContents(result.data.files ?? [])

      setPrompts(result.data)
      return { ...result.data, error: null }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al compilar"
      setError(message)
      return {
        contextualPrompt: "",
        exportablePrompt: "",
        files: [],
        error: message,
      }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    compileContext,
    isProcessingContext: isProcessing,
    contextProcessError: error,
  }
}
