import "server-only"

import { getImageMimeType } from "@/shared/utils/image-utils"
import { config } from "@/shared/lib/config"
import { ImageFile } from "@/shared/types/image-file"
import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import { DEFAULT_IGNORE } from "../lib/constants"
import { validateAndSanitizePath } from "../lib/file-utils"
import { AbsolutePath, Extension, FileContent } from "../model/types"
import {
  ALLOWED_EXTENSIONS,
  getStrategyForExtension,
} from "../strategies/strategy-registry"

const CONCURRENCY_LIMIT = 20

/**
 * Lee un archivo de manera segura procesando sus dependencias mediante la estrategia adecuada.
 */
const processFile = cache(
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

/**
 * Carga contenidos en lotes concurrentes para evitar agotar FDs (File Descriptors).
 */
async function getFileContentsWithDependencies(
  paths: AbsolutePath[],
  projectRoot: AbsolutePath
): Promise<FileContent[]> {
  const uniquePaths = Array.from(new Set(paths))
  const results: FileContent[] = []

  for (let i = 0; i < uniquePaths.length; i += CONCURRENCY_LIMIT) {
    const batch = uniquePaths.slice(i, i + CONCURRENCY_LIMIT)
    const batchResults = await Promise.all(
      batch.map((p) => processFile(p, projectRoot))
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * Carga imágenes locales codificadas en Base64 de forma segura.
 */
export async function loadLocalImages(
  filePaths: string[],
  projectRoot: string = config.TARGET_PROJECT_PATH
): Promise<ImageFile[]> {
  const root = path.resolve(projectRoot)

  const images = await Promise.all(
    filePaths.map(async (filePath) => {
      const safePath = validateAndSanitizePath(filePath, root)
      if (!safePath) {
        console.error(`Acceso denegado fuera de la raíz: ${filePath}`)
        return null
      }

      try {
        const fileBuffer = await fs.readFile(safePath)
        return {
          mimeType: getImageMimeType(filePath),
          base64: fileBuffer.toString("base64"),
        }
      } catch (error) {
        console.error(`Error al leer imagen local (${filePath}):`, error)
        return null
      }
    })
  )

  return images.filter((img): img is ImageFile => img !== null)
}

/**
 * Construye el grafo de archivos a partir de puntos de entrada de forma recursiva.
 */
export const loadProjectGraph = cache(
  async (
    entryPoints: string[],
    includeDeps = true,
    projectRoot: string = config.TARGET_PROJECT_PATH
  ): Promise<FileContent[]> => {
    const root = path.resolve(projectRoot) as AbsolutePath
    const resolvedEntryPoints = entryPoints
      .map((p) => validateAndSanitizePath(p, root))
      .filter((p): p is AbsolutePath => p !== null)

    const visited = new Set<AbsolutePath>()
    const results = new Map<AbsolutePath, FileContent>()
    let nodesToProcess: AbsolutePath[] = resolvedEntryPoints

    while (nodesToProcess.length > 0) {
      const toProcess = nodesToProcess.filter((p) => !visited.has(p))
      nodesToProcess = []
      if (toProcess.length === 0) break

      toProcess.forEach((p) => visited.add(p))
      const processedFiles = await getFileContentsWithDependencies(
        toProcess,
        root
      )

      for (const file of processedFiles) {
        const absPath = file.path as AbsolutePath
        results.set(absPath, file)

        if (includeDeps && file.dependencies) {
          for (const dep of file.dependencies) {
            if (!visited.has(dep as AbsolutePath)) {
              nodesToProcess.push(dep as AbsolutePath)
            }
          }
        }
      }
      if (!includeDeps) break
    }

    return Array.from(results.values()).map((file) => ({
      ...file,
      path: path.relative(root, file.path).replace(/\\/g, "/"),
      dependencies: file.dependencies?.map((dep) =>
        path.relative(root, dep).replace(/\\/g, "/")
      ),
    }))
  }
)

export async function recursiveFileSearch(
  dir: string,
  extensions: ReadonlySet<Extension> = ALLOWED_EXTENSIONS,
  ignore: Set<string> = DEFAULT_IGNORE
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const promises = entries.map(async (entry) => {
    if (ignore.has(entry.name)) return []
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory())
      return recursiveFileSearch(fullPath, extensions, ignore)
    return entry.isFile() &&
      extensions.has(path.extname(entry.name).toLowerCase() as Extension)
      ? [fullPath.replace(/\\/g, "/")]
      : []
  })
  return (await Promise.all(promises)).flat()
}

export const getFilePaths = cache(
  async (
    folder: string = config.TARGET_PROJECT_PATH,
    extensions: ReadonlySet<Extension> = ALLOWED_EXTENSIONS,
    ignore: string[] = Array.from(DEFAULT_IGNORE)
  ) => {
    const stat = await fs.stat(folder).catch(() => null)
    if (!stat?.isDirectory()) throw new Error(`Path invalido: ${folder}`)

    const absolutePaths = await recursiveFileSearch(
      folder,
      extensions,
      new Set(ignore)
    )
    const resolvedRoot = path.resolve(folder)

    return absolutePaths.map((p) =>
      path.relative(resolvedRoot, p).replace(/\\/g, "/")
    )
  }
)
