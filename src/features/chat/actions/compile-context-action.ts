"use server"

import { FileContent } from "@/shared/services/file-service/types"
import { ActionResponse } from "@/shared/types/action-state"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import { z } from "zod"
import { buildChatContext } from "../utils/chat-context-builder"

const CompileContextInputSchema = z.object({
  task: z.string().min(1),
  systemPrompt: z.string().default(""),
  includeContext: z.boolean().default(true),
  includeDependencies: z.boolean().default(false),
  selectedFilePaths: z.array(z.string()),
  webSources: z.array(z.object({ path: z.string(), content: z.string() })),
})

export type CompileContextInput = z.infer<typeof CompileContextInputSchema>

export async function compileContextAction(input: CompileContextInput): Promise<
  ActionResponse<{
    contextualPrompt: string
    exportablePrompt: string
    files: FileContent[]
  }>
> {
  const parsed = CompileContextInputSchema.safeParse(input)
  if (!parsed.success)
    return { error: "Entrada inválida para compilar contexto" }

  try {
    const {
      task,
      systemPrompt,
      includeContext,
      includeDependencies,
      selectedFilePaths,
      webSources,
    } = parsed.data
    if (!includeContext) {
      const builder = new PromptBuilder().addSystem(systemPrompt).addTask(task)
      return {
        data: {
          contextualPrompt: builder.buildContextAndTask(),
          exportablePrompt: builder.build(),
          files: [],
        },
      }
    }

    const result = await buildChatContext({
      systemPrompt,
      task,
      selectedFilePaths,
      includeDependencies,
      webSources,
    })
    return { data: result }
  } catch (error) {
    console.error("[compileContextAction] Error:", error)
    return { error: "Error inesperado al compilar el contexto" }
  }
}
