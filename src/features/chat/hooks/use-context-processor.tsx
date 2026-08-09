"use client"

import { fetchFileContextAction } from "@/features/file-explorer/actions/fetch-file-context"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useInferenceStore } from "@/features/inference/store/inference-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import { useActionState } from "react"
import { useChatStore } from "../store/chat-store"

export function useContextProcessor() {
  const [contextProcessState, handleProcessContext, isProcessingContext] =
    useActionState(
      async (_: unknown, formData: FormData) => {
        const { data, error } = await fetchFileContextAction({}, formData)

        if (error || !data) {
          return {
            error: error ?? "Se produjo un error al analizar los archivos",
          }
        }

        const userTask = useChatStore.getState().userTask
        const setPrompts = useChatStore.getState().actions.setPrompts
        const { setFileContents, setImageFiles: setImages } =
          useFileExplorerStore.getState()

        const { crawledPages, selectedUrls } = useWebCrawlerStore.getState()
        const selectedWebPages = crawledPages.filter(
          (page) => selectedUrls.includes(page.url) && page.content
        )

        const formattedWebSources = selectedWebPages.map((page) => ({
          path: `[Web] ${page.title || page.url} (${page.url})`,
          content: page.content ?? "",
        }))

        const localFiles = data.fileContents ?? []
        const combinedContextFiles = [...localFiles, ...formattedWebSources]
        const systemPrompt = useInferenceStore.getState().systemPrompt

        const promptBuilder = new PromptBuilder()
          .addSystem(systemPrompt)
          .addContext(combinedContextFiles)
          .addTask(userTask)

        setFileContents(data.fileContents)
        setImages(data.imageFiles)
        setPrompts({
          contextualPrompt: promptBuilder.buildContextAndTask(),
          exportablePrompt: promptBuilder.build(),
        })

        return { error: null }
      },
      { error: null }
    )

  return {
    contextProcessState,
    handleProcessContext,
    isProcessingContext,
  }
}
