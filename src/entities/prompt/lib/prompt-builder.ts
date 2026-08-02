import { renderMdTemplate } from "@/shared/lib/render-md-template"

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

    this.system = renderMdTemplate(DEFAULT_INSTRUCTIONS, {
      systemPrompt: trimmedPrompt,
    })
    return this
  }

  addContext(context: string): this {
    this.context = renderMdTemplate(DEFAULT_CONTEXT, {
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
    this.task = renderMdTemplate(DEFAULT_TASK, { userInput: trimmedInput })
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
