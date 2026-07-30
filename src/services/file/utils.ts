import "server-only"

import path from "node:path"
import { cache } from "react"
import { supabase } from "@/lib/supabase"
import { DEFAULT_IGNORE } from "./constants"
import { ALLOWED_EXTENSIONS } from "./strategies/strategy-registry"
import type { AbsolutePath, Extension } from "./types"
import { cacheLife } from "next/cache"

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "public"

/**
 * Normaliza una ruta de Supabase Storage a formato POSIX sin slash inicial.
 * Ejemplo:
 *   "/documents/matias/texto.txt" -> "documents/matias/texto.txt"
 */
function normalizeStoragePath(value: string): string {
  const normalized = path.posix.normalize((value || "").replace(/\\/g, "/"))
  if (normalized === "." || normalized === "/") return ""
  return normalized.replace(/^\/+/, "").replace(/\/+$/, "")
}

/**
 * Normaliza la raíz del proyecto en formato de bucket de Supabase.
 * Ejemplo:
 *   "/documents/matias" -> "documents/matias"
 */
function normalizeProjectRoot(
  projectRoot: string = process.env.TARGET_PROJECT_PATH || ""
): string {
  return normalizeStoragePath(projectRoot)
}

/**
 * Convierte una ruta real de Supabase Storage a una ruta relativa al proyecto
 * con slash inicial.
 * Ejemplo:
 *   storagePath: "documents/matias/texto.txt"
 *   projectRoot: "/documents/matias"
 *   => "/texto.txt"
 */
export function toProjectRelativePath(
  storagePath: string,
  projectRoot: string = process.env.TARGET_PROJECT_PATH || ""
): string | null {
  const cleanRoot = normalizeProjectRoot(projectRoot)
  const cleanPath = normalizeStoragePath(storagePath)

  if (!cleanPath) return null

  if (!cleanRoot) {
    return `/${cleanPath}`.replace(/\/+/g, "/")
  }

  if (cleanPath !== cleanRoot && !cleanPath.startsWith(`${cleanRoot}/`)) {
    return null
  }

  const relative = path.posix.relative(cleanRoot, cleanPath)
  if (!relative || relative === ".") return "/"

  return `/${relative}`.replace(/\/+/g, "/")
}

/**
 * Convierte una ruta relativa al proyecto a una ruta real dentro del bucket.
 * Acepta:
 *   "/texto.txt"
 *   "texto.txt"
 * y devuelve:
 *   "documents/matias/texto.txt"
 */
export function fromProjectRelativePath(
  targetPath: string,
  projectRoot: string = process.env.TARGET_PROJECT_PATH || ""
): AbsolutePath | null {
  if (!targetPath || typeof targetPath !== "string") return null
  if (targetPath.includes("\0")) return null

  const cleanRoot = normalizeProjectRoot(projectRoot)
  const normalizedInput = path.posix.normalize(targetPath.replace(/\\/g, "/"))

  const combined = normalizedInput.startsWith("/")
    ? `${cleanRoot}${normalizedInput}`
    : cleanRoot
      ? `${cleanRoot}/${normalizedInput}`
      : normalizedInput

  const candidate = path.posix.normalize(combined).replace(/^\/+/, "")

  if (
    candidate === ".." ||
    candidate.startsWith("../") ||
    candidate.includes("/../") ||
    candidate.endsWith("/..")
  ) {
    return null
  }

  if (
    cleanRoot &&
    candidate !== cleanRoot &&
    !candidate.startsWith(`${cleanRoot}/`)
  ) {
    return null
  }

  return candidate as AbsolutePath
}

/**
 * Recorre recursivamente un bucket de Supabase Storage aplicando las reglas de
 * filtrado por extensión y exclusión por carpetas/archivos ignorados.
 *
 * Supabase list() espera paths sin slash inicial/final y devuelve únicamente
 * hijos inmediatos del prefijo consultado. [web:18][web:4]
 */
async function recursiveSupabaseSearch(
  dir: string = "",
  extensions: ReadonlySet<Extension> = ALLOWED_EXTENSIONS,
  ignore: Set<string> = DEFAULT_IGNORE
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(dir, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  })

  if (error || !data) {
    console.error(
      `[Supabase Storage] Error al listar en "${dir}":`,
      error?.message
    )
    return []
  }

  const filePromises = data.map(async (entry) => {
    if (entry.name === ".emptyFolderPlaceholder") return []
    if (ignore.has(entry.name)) return []

    const fullPath = dir ? `${dir}/${entry.name}` : entry.name

    // En Supabase, las carpetas tienen id y metadata en null. [web:18]
    const isFolder = entry.id === null || entry.metadata === null

    if (isFolder) {
      return recursiveSupabaseSearch(fullPath, extensions, ignore)
    }

    const ext = path.extname(entry.name).toLowerCase() as Extension
    if (extensions.has(ext)) {
      return [fullPath.replace(/\\/g, "/")]
    }

    return []
  })

  const results = await Promise.all(filePromises)
  return results.flat()
}

/**
 * Obtiene la lista completa de archivos válidos en Supabase Storage y devuelve
 * rutas relativas al proyecto con slash inicial.
 *
 * Ejemplo:
 *   TARGET_PROJECT_PATH=/documents/matias
 *   archivo real: documents/matias/texto.txt
 *   salida: /texto.txt
 */
export const getFilePaths = cache(
  async (
    folder: string = process.env.TARGET_PROJECT_PATH || "",
    extensions: ReadonlySet<Extension> = ALLOWED_EXTENSIONS,
    ignore: string[] = Array.from(DEFAULT_IGNORE)
  ): Promise<string[]> => {
    "use cache"
    cacheLife("weeks")
    const cleanFolder = normalizeProjectRoot(folder)
    const ignoreSet = new Set(ignore)

    const storagePaths = await recursiveSupabaseSearch(
      cleanFolder,
      extensions,
      ignoreSet
    )

    return storagePaths
      .map((filePath) => toProjectRelativePath(filePath, cleanFolder))
      .filter((filePath): filePath is string => filePath !== null)
      .sort((a, b) => a.localeCompare(b))
  }
)

/**
 * Normaliza y verifica que una ruta relativa al proyecto sea válida y segura,
 * devolviendo la ruta real dentro del bucket de Supabase.
 *
 * Ejemplo:
 *   targetPath: "/texto.txt"
 *   projectRoot: "/documents/matias"
 *   => "documents/matias/texto.txt"
 */
export function validateAndSanitizePath(
  targetPath: string,
  projectRoot: string = process.env.TARGET_PROJECT_PATH || ""
): AbsolutePath | null {
  return fromProjectRelativePath(targetPath, projectRoot)
}
