import fs from "fs/promises"
import path from "path"
import { cache } from "react"
import type { AbsolutePath, Extension, FileContent } from "../model/file-types"
import {
  ALLOWED_EXTENSIONS,
  getStrategyForExtension,
} from "../strategies/strategy-registry"

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

/**
 * Lee un archivo de manera segura procesando sus dependencias mediante la estrategia adecuada.
 */
export const readFileContent = cache(
  async (
    currentPath: AbsolutePath,
    projectRoot: AbsolutePath
  ): Promise<FileContent> => {
    const ext = path.extname(currentPath).toLowerCase() as Extension

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        path: currentPath,
        error: `Extensión no permitida: ${ext}`,
      }
    }

    try {
      const content = await fs.readFile(currentPath, "utf-8")
      const dependencies = new Set<string>()
      const strategy = getStrategyForExtension(ext)

      if (strategy) {
        const specifiers = strategy.extractImports(content)

        for (const specifier of specifiers) {
          const resolved = await strategy.resolveImport(
            specifier,
            currentPath,
            projectRoot
          )
          if (resolved) {
            dependencies.add(resolved)
          }
        }
      }

      return {
        path: currentPath,
        content,
        dependencies: Array.from(dependencies),
        language: ext.slice(1),
      }
    } catch (err) {
      return {
        path: currentPath,
        content: "",
        error: err instanceof Error ? err.message : String(err),
        dependencies: [],
      }
    }
  }
)
