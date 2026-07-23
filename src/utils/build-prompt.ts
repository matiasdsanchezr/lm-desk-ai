import { FileContent } from "@/types/file-content"
import { renderTemplate } from "./templates"

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

const DEFAULT_FILE = `\
<file path="{{path}}" language="{{lang}}">
{{content}}
</file>`

const SECTIONS_SEPARATOR = "\n\n---\n\n"

const SYSTEM_TAGS_REGEX =
  /<(\/?(?:system_instructions|context|file|userInput)\b[^>]*)>/gi

export const sanitizeXmlContent = (content: string): string => {
  if (!content) return ""
  return content.replace(SYSTEM_TAGS_REGEX, "&lt;$1&gt;")
}

const formatFilesContent = (files: FileContent[]): string => {
  const validFiles = files.filter((f) => !f.error && f.content)

  if (validFiles.length === 0) {
    return ""
  }

  const template = DEFAULT_FILE
  return validFiles
    .map((file) =>
      renderTemplate(template, {
        path: file.path,
        lang: file.language ?? "",
        content: sanitizeXmlContent(file.content ?? ""),
      })
    )
    .join("\n")
}

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

  addContext(files: FileContent[]): this {
    const formattedFilesContent = formatFilesContent(files)
    if (!formattedFilesContent) {
      this.context = undefined
      return this
    }

    this.context = renderTemplate(DEFAULT_CONTEXT, {
      filesContent: formattedFilesContent,
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
