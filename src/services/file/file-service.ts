import "server-only"

import { config } from "@/lib/config"
import { supabase } from "@/lib/supabase"
import type { ImageFile } from "@/types/image-file"
import { getImageMimeType } from "@/utils/images"
import path from "node:path"
import { cache } from "react"
import {
  ALLOWED_EXTENSIONS,
  getStrategyForExtension,
} from "./strategies/strategy-registry"
import type { AbsolutePath, Extension, FileContent } from "./types"
import { toProjectRelativePath, validateAndSanitizePath } from "./utils"

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "public"
const CONCURRENCY_LIMIT = 20

function normalizeProjectRoot(value: string): AbsolutePath {
  const normalized = path.posix
    .normalize((value || "").replace(/\\/g, "/"))
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")

  return (normalized === "." ? "" : normalized) as AbsolutePath
}

/**
 * Descarga y lee un archivo desde Supabase Storage procesando sus dependencias
 * mediante la estrategia adecuada.
 *
 * currentPath y projectRoot siempre están en formato real del bucket:
 *   "documents/matias/texto.txt"
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
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(currentPath)

      if (error || !data) {
        throw new Error(
          error?.message ||
            `No se pudo descargar el archivo "${currentPath}" de Supabase`
        )
      }

      const content = await data.text()
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
 * Carga contenidos desde Supabase Storage en lotes concurrentes.
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
 * Carga imágenes almacenadas en Supabase Storage codificadas en Base64 de forma segura.
 * filePaths debe venir en formato relativo al proyecto:
 *   "/assets/logo.png"
 */
export async function loadLocalImages(
  filePaths: string[],
  projectRoot: string = config.TARGET_PROJECT_PATH || ""
): Promise<ImageFile[]> {
  const images = await Promise.all(
    filePaths.map(async (filePath) => {
      const safePath = validateAndSanitizePath(filePath, projectRoot)
      if (!safePath) {
        console.error(`Acceso denegado fuera de la raíz: ${filePath}`)
        return null
      }

      try {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(safePath)

        if (error || !data) {
          console.error(
            `Error al descargar la imagen de Supabase (${filePath}):`,
            error?.message
          )
          return null
        }

        const arrayBuffer = await data.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")

        return {
          mimeType: getImageMimeType(filePath) || data.type,
          base64,
        }
      } catch (error) {
        console.error(
          `Error al procesar la imagen de Supabase (${filePath}):`,
          error
        )
        return null
      }
    })
  )

  return images.filter((img): img is ImageFile => img !== null)
}

/**
 * Construye el grafo de archivos a partir de puntos de entrada.
 *
 * Entrada esperada:
 *   ["/texto.txt"]
 *
 * Resolución interna:
 *   "documents/matias/texto.txt"
 *
 * Salida:
 *   path: "/texto.txt"
 *   dependencies: ["/algo.ts"]
 */
export const loadProjectGraph = cache(
  async (entryPoints: string[], includeDeps = true): Promise<FileContent[]> => {
    const root = normalizeProjectRoot(
      config.TARGET_PROJECT_PATH || ""
    ) as AbsolutePath

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
        const storagePath = file.path as AbsolutePath
        results.set(storagePath, file)

        if (includeDeps && file.dependencies) {
          for (const dep of file.dependencies) {
            const depPath = dep as AbsolutePath
            if (!visited.has(depPath)) {
              nodesToProcess.push(depPath)
            }
          }
        }
      }

      if (!includeDeps) break
    }

    return Array.from(results.values()).map((file) => {
      const publicPath = toProjectRelativePath(file.path, root) ?? file.path

      const publicDeps = file.dependencies?.map(
        (dep) => toProjectRelativePath(dep, root) ?? dep
      )

      return {
        ...file,
        path: publicPath.replace(/\\/g, "/"),
        dependencies: publicDeps?.map((d) => d.replace(/\\/g, "/")),
      }
    })
  }
)
