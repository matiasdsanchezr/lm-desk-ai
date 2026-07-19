import { FileContent } from "@/types/file-content"
import { renderTemplate } from "./templates"

const DEFAULT_INSTRUCTIONS = `## INSTRUCCIONES DEL SISTEMA
<system_instructions>
{{systemPrompt}}
</system_instructions>`

const DEFAULT_CONTEXT = `## CONTEXTO DEL PROYECTO
<context>
{{context}}
</context>`

const DEFAULT_TASK = `## TAREA DEL USUARIO
<task>
{{userInput}}
</task>`

const DEFAULT_FILE = `<file path="{{path}}">
{{content}}
</file>`

const SECTIONS_SEPARATOR = "\n\n---\n\n"

const formatFileContext = (files: FileContent[]): string => {
  const template = DEFAULT_FILE
  return files
    .map((file) =>
      renderTemplate(template, {
        path: file.path,
        content: file.content || "",
      })
    )
    .join("\n")
}

export class PromptBuilder {
  private system?: string
  private context?: string
  private task?: string

  addSystem(prompt: string): this {
    const template = DEFAULT_INSTRUCTIONS
    this.system = renderTemplate(template, { systemPrompt: prompt })
    return this
  }

  addContext(files: FileContent[]): this {
    if (files.length === 0) {
      this.context = undefined
      return this
    }

    const template = DEFAULT_CONTEXT
    this.context = renderTemplate(template, {
      context: formatFileContext(files),
    })
    return this
  }

  addTask(input: string): this {
    const template = DEFAULT_TASK
    this.task = renderTemplate(template, { userInput: input })
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
