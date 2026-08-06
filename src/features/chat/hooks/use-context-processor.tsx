"use client"

import { fetchFileContextAction } from "@/features/file-explorer/actions/fetch-file-context"
import { useFileExplorerStore } from "@/features/file-explorer/store/file-explorer-store"
import { useSettingsStore } from "@/features/inference-settings/store/settings-store"
import { useWebCrawlerStore } from "@/features/web-crawler/store/web-crawler-store"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import { useActionState } from "react"
import { useChatStore } from "../store/chat-store"

export function useContextProcessor() {
  const systemPrompt = useSettingsStore((s) => s.systemPrompt)

  const [fetchFileState, handleFetchFileContents, isFetchingFiles] =
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

        const webContextFiles = selectedWebPages.map((page) => ({
          path: `[Web] ${page.title || page.url} (${page.url})`,
          content: page.content ?? "",
        }))

        const localFiles = data.fileContents ?? []
        const combinedContextFiles = [...localFiles, ...webContextFiles]

        const promptBuilder = new PromptBuilder()
          .addSystem(systemPrompt)
          .addContext(combinedContextFiles)
          .addTask(userTask)

        setFileContents(data.fileContents)
        setImages(data.imageFiles)
        setPrompts({
          contextualPrompt: promptBuilder.buildContextAndTask(),
          standalonePrompt: promptBuilder.build(),
        })

        return { error: null }
      },
      { error: null }
    )

  return {
    fetchFileState,
    handleFetchFileContents,
    isFetchingFiles,
  }
}
