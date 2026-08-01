import { renderTemplate } from "@/shared/utils/template-utils"
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
