"use server"

import { ActionResponse } from "@/shared/types/action-state"
import { PromptBuilder } from "@/shared/utils/prompt-builder"
import { z } from "zod"
import {
  contextSourceSchema,
  type ContextSource,
  type FileSource,
} from "../types"
import { buildChatContext } from "../utils/chat-context-builder"

const CompileContextInputSchema = z.object({
  task: z.string().min(1),
  systemPrompt: z.string().default(""),
  includeContext: z.boolean().default(true),
  includeDependencies: z.boolean().default(false),
  sources: z.array(contextSourceSchema).default([]),
})

export type CompileContextInput = z.infer<typeof CompileContextInputSchema>

export async function compileContextAction(input: CompileContextInput): Promise<
  ActionResponse<{
    contextualPrompt: string
    exportablePrompt: string
    sources: ContextSource[]
    files: FileSource[]
  }>
> {
  const parsed = CompileContextInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: "Entrada inválida para compilar contexto" }
  }

  try {
    const { task, systemPrompt, includeContext, includeDependencies, sources } =
      parsed.data

    if (!includeContext || sources.length === 0) {
      const builder = new PromptBuilder().addSystem(systemPrompt).addTask(task)

      return {
        data: {
          contextualPrompt: builder.buildContextAndTask(),
          exportablePrompt: builder.build(),
          sources: [],
          files: [],
        },
      }
    }

    const result = await buildChatContext({
      systemPrompt,
      task,
      sources,
      includeDependencies,
    })

    const files = result.sources.filter(
      (s): s is FileSource => s.type === "file"
    )

    return {
      data: {
        ...result,
        files,
      },
    }
  } catch (error) {
    console.error("[compileContextAction] Error:", error)
    return { error: "Error inesperado al compilar el contexto" }
  }
}
