"use server"

import { fetchFileContextAction } from "@/features/file-explorer/actions/fetch-file-context"
import { FileContent } from "@/shared/services/file-service"
import { ActionResponse } from "@/shared/types/action-state"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import { z } from "zod"

const CompileContextInputSchema = z.object({
  task: z.string().min(1),
  systemPrompt: z.string().default(""),
  includeContext: z.boolean().default(true),
  includeDependencies: z.boolean().default(false),
  selectedFilePaths: z.array(z.string()),
  webSources: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ),
})

export type CompileContextInput = z.infer<typeof CompileContextInputSchema>

export type CompileContextResult = {
  contextualPrompt: string
  exportablePrompt: string
  files: FileContent[]
}

export async function compileContextAction(
  input: CompileContextInput
): Promise<ActionResponse<CompileContextResult>> {
  const parsed = CompileContextInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: "Entrada inválida para compilar contexto" }
  }

  const {
    task,
    systemPrompt,
    includeContext,
    includeDependencies,
    selectedFilePaths,
    webSources,
  } = parsed.data

  try {
    let localFiles: FileContent[] = []

    if (includeContext && selectedFilePaths.length > 0) {
      const formData = new FormData()
      selectedFilePaths.forEach((path) => formData.append("filePath", path))
      formData.append("includeDependencies", String(includeDependencies))
      formData.append("systemPrompt", systemPrompt)

      const result = await fetchFileContextAction({}, formData)
      if (result.error || !result.data) {
        return {
          error:
            result.error ?? "No se pudieron leer los archivos seleccionados",
        }
      }
      localFiles = result.data.fileContents ?? []
    }

    const combinedContext = includeContext ? [...localFiles, ...webSources] : []

    const builder = new PromptBuilder()
      .addSystem(systemPrompt)
      .addContext(combinedContext)
      .addTask(task)

    return {
      data: {
        contextualPrompt: builder.buildContextAndTask(),
        exportablePrompt: builder.build(),
        files: localFiles,
      },
    }
  } catch (error) {
    console.error("[compileContextAction] Error:", error)
    return { error: "Error inesperado al compilar el contexto" }
  }
}
