import path from "node:path"
import { AbsolutePath, FileContent } from "../model/types"

/**
 * Normaliza y verifica que una ruta absoluta resida estrictamente dentro de la raíz del proyecto.
 * Previene ataques de travesía de directorios (Path Traversal).
 */
export function validateAndSanitizePath(
  targetPath: string,
  projectRoot: string
): AbsolutePath | null {
  const resolvedRoot = path.resolve(projectRoot)
  const resolvedTarget = path.resolve(resolvedRoot, targetPath)

  if (!resolvedTarget.startsWith(resolvedRoot)) {
    return null
  }

  return resolvedTarget as AbsolutePath
}

const DEFAULT_FILE = `\
<file path="{{path}}" language="{{lang}}">
{{content}}
</file>`

const SYSTEM_TAGS_REGEX =
  /<(\/?(?:system_instructions|context|file|userInput)\b[^>]*)>/gi

const sanitizeXmlContent = (content: string): string => {
  if (!content) return ""
  return content.replace(SYSTEM_TAGS_REGEX, "&lt;$1&gt;")
}

export const formatFilesContent = (files: FileContent[]): string => {
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

const TEMPLATE_REGEX = /\{\{([^{}]+)\}\}/g
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
