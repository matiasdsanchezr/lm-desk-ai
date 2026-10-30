import {
  buildProjectDependencyGraph,
  isImageFile,
} from "@/shared/services/file-service"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import type { ContextSource, FileSource, WebSource } from "../types"

interface BuildChatContextParams {
  systemPrompt: string
  task: string
  sources: ContextSource[]
  includeDependencies: boolean
}

export async function buildChatContext({
  systemPrompt,
  task,
  sources,
  includeDependencies,
}: BuildChatContextParams): Promise<{
  contextualPrompt: string
  exportablePrompt: string
  sources: ContextSource[]
}> {
  const fileSources = sources.filter((s): s is FileSource => s.type === "file")
  const webSources = sources.filter((s): s is WebSource => s.type === "web")

  const textFilePaths = fileSources
    .map((s) => s.path)
    .filter((path) => !isImageFile(path))

  const localFiles = textFilePaths.length
    ? await buildProjectDependencyGraph(textFilePaths, includeDependencies)
    : []

  const normalizedFileSources: FileSource[] = localFiles.map((file) => ({
    type: "file",
    path: file.path,
    content: file.content,
    error: file.error,
    dependencies: file.dependencies,
    language: file.language,
  }))

  const allSources: ContextSource[] = [...normalizedFileSources, ...webSources]

  const promptContextItems = allSources.map((source) => ({
    path:
      source.type === "file"
        ? source.path
        : `[Web] ${source.title || source.url} (${source.url})`,
    content: source.content ?? "",
  }))

  const builder = new PromptBuilder()
    .addSystem(systemPrompt)
    .addContext(promptContextItems)
    .addTask(task)

  return {
    contextualPrompt: builder.buildContextAndTask(),
    exportablePrompt: builder.build(),
    sources: allSources,
  }
}
