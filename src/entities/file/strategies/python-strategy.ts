import path from "node:path"
import { AbsolutePath, LanguageStrategy } from "../model/types"
import fs from "node:fs/promises"

const PYTHON_IMPORT_REGEX =
  /^\s*(?:from\s+([a-zA-Z0-9_.-]+)\s+import|import\s+([a-zA-Z0-9_.-]+))/gm

export const pythonStrategy: LanguageStrategy = {
  extensions: new Set([".py"]),

  extractImports(content: string) {
    const matches = [...content.matchAll(PYTHON_IMPORT_REGEX)]
    return matches
      .map((match) => match[1] || match[2])
      .filter(Boolean) as string[]
  },

  async resolveImport(importSpecifier, currentFile, projectRoot) {
    const currentDir = path.dirname(currentFile)
    let resolvedPath: string | null = null

    // 1. Manejar imports relativos de Python (Ej: from .utils import helper, from ..db import engine)
    if (importSpecifier.startsWith(".")) {
      const dotMatch = importSpecifier.match(/^(\.+)(.*)$/)
      if (dotMatch) {
        const dots = dotMatch[1]!
        const modulePath = dotMatch[2]! // Ej: "utils"

        let targetDir = currentDir
        // Cada punto adicional retrocede un nivel en el directorio
        for (let i = 1; i < dots.length; i++) {
          targetDir = path.dirname(targetDir)
        }

        const subPath = modulePath.replace(/\./g, "/")
        resolvedPath = path.join(targetDir, subPath)
      }
    } else {
      // 2. Imports absolutos del proyecto (Ej: import src.core.config)
      const subPath = importSpecifier.replace(/\./g, "/")
      resolvedPath = path.join(projectRoot, subPath)
    }

    if (!resolvedPath) return null

    // Candidatos en Python: archivo.py o archivo/__init__.py
    const candidates = [
      `${resolvedPath}.py`,
      path.join(resolvedPath, "__init__.py"),
    ]

    for (const candidate of candidates) {
      try {
        await fs.access(candidate)
        // Validar seguridad: que esté dentro del root del proyecto
        if (candidate.startsWith(projectRoot)) {
          return candidate as AbsolutePath
        }
      } catch {
        continue
      }
    }
    return null
  },
}
