import { FileContent } from "@/entities/file/model/file-types"

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

export const DEFAULT_FILE_TEMPLATE = `\
<file path="{{path}}" language="{{lang}}">
{{content}}
</file>`

const SECTIONS_SEPARATOR = "\n\n---\n\n"

const TEMPLATE_REGEX = /\{\{([^{}]+)\}\}/g

const SYSTEM_TAGS_REGEX =
  /<(\/?(?:system_instructions|context|file|userInput)\b[^>]*)>/gi

const sanitizeXmlContent = (content: string): string => {
  if (!content) return ""
  return content.replace(SYSTEM_TAGS_REGEX, "&lt;$1&gt;")
}

type TemplateVars = Record<string, string | number | boolean>

/**
 * Reemplaza los placeholders {{key}}
 * con los valores proporcionados en un objeto.
 * @param template - Template string con placeholders tipo {{key}}
 * @param variables - Objeto con los valores a inyectar
 * @returns El contenido del template procesado
 */
export const renderTemplate = (
  template: string,
  variables: TemplateVars
): string => {
  return template.replace(TEMPLATE_REGEX, (match, key: string) => {
    const trimmedKey = key.trim()

    if (variables[trimmedKey] !== undefined) {
      return String(variables[trimmedKey])
    } else {
      console.warn(`Variable no encontrada en el template: "${trimmedKey}"`)
      return ""
    }
  })
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

/**
 * Formatea el contenido de los archivos para ser impreso
 * @param files - Lista de archivos a formatear
 * @returns Contenido formateado
 */
export const formatFilesContent = (files: FileContent[]): string => {
  const validFiles = files.filter((f) => !f.error && f.content)

  if (validFiles.length === 0) {
    return ""
  }

  const template = DEFAULT_FILE_TEMPLATE
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
