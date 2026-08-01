import { FileContent } from "@/entities/file/model/types"
import { renderTemplate } from "@/shared/utils/template-utils"

const DEFAULT_INSTRUCTIONS = `\
<system_instructions>
{{systemPrompt}}
</system_instructions>`

const DEFAULT_CONTEXT = `\
<context>
{{filesContent}}
</context>`

const DEFAULT_TASK = `## TAREA DEL USUARIO

{{userInput}}`

const SECTIONS_SEPARATOR = "\n\n---\n\n"

export class PromptBuilder {
  private system?: string
  private context?: string
  private task?: string

  addSystem(prompt: string): this {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      this.system = undefined
      return this
    }

    this.system = renderTemplate(DEFAULT_INSTRUCTIONS, {
      systemPrompt: trimmedPrompt,
    })
    return this
  }

  addContext(context: string): this {
    this.context = renderTemplate(DEFAULT_CONTEXT, {
      filesContent: context,
    })
    return this
  }

  addTask(input: string): this {
    const trimmedInput = input.trim()
    if (!trimmedInput) {
      this.task = undefined
      return this
    }
    this.task = renderTemplate(DEFAULT_TASK, { userInput: trimmedInput })
    return this
  }

  private buildSections(sections: (string | undefined)[]): string {
    return sections.filter(Boolean).join(SECTIONS_SEPARATOR).trim()
  }

  build(): string {
    return this.buildSections([this.system, this.context, this.task])
  }

  buildContextAndTask(): string {
    return this.buildSections([this.context, this.task])
  }
}
