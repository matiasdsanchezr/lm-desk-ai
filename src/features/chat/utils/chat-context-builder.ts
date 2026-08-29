import {
  buildProjectDependencyGraph,
  FileContent,
  isImageFile,
} from "@/shared/services/file-service"
import { PromptBuilder } from "@/shared/utils/prompt-builder"

export type WebSource = { path: string; content: string }

export async function buildChatContext(params: {
  systemPrompt: string
  task: string
  selectedFilePaths: string[]
  includeDependencies: boolean
  webSources: WebSource[]
}): Promise<{
  contextualPrompt: string
  exportablePrompt: string
  files: FileContent[]
}> {
  const {
    systemPrompt,
    task,
    selectedFilePaths,
    includeDependencies,
    webSources,
  } = params

  const textFilePaths = selectedFilePaths.filter((p) => !isImageFile(p))
  const localFiles = textFilePaths.length
    ? await buildProjectDependencyGraph(textFilePaths, includeDependencies)
    : []

  const combinedContext = [...localFiles, ...webSources]
  const builder = new PromptBuilder()
    .addSystem(systemPrompt)
    .addContext(combinedContext)
    .addTask(task)

  return {
    contextualPrompt: builder.buildContextAndTask(),
    exportablePrompt: builder.build(),
    files: localFiles,
  }
}
