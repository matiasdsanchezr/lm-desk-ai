import fs from "node:fs/promises"
import path from "node:path"
import { DEFAULT_IGNORE, IMAGE_MIME_TYPES } from "./constants"
import { ALLOWED_EXTENSIONS } from "./strategies/strategy-registry"
import { AbsolutePath, Extension } from "./types"

export async function scanDirectory(
  dir: string,
  extensions: ReadonlySet<Extension> = ALLOWED_EXTENSIONS,
  ignore: Set<string> = DEFAULT_IGNORE
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const promises = entries.map(async (entry) => {
    if (ignore.has(entry.name)) return []
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return scanDirectory(fullPath, extensions, ignore)
    return entry.isFile() &&
      extensions.has(path.extname(entry.name).toLowerCase() as Extension)
      ? [fullPath.replace(/\\/g, "/")]
      : []
  })
  return (await Promise.all(promises)).flat()
}

export function sanitizePathWithinRoot(
  targetPath: string,
  projectRoot: string
): AbsolutePath | null {
  const resolvedRoot = path.resolve(projectRoot)
  const resolvedTarget = path.resolve(resolvedRoot, targetPath)
  const relative = path.relative(resolvedRoot, resolvedTarget)
  const isOutside = relative.startsWith("..") || path.isAbsolute(relative)
  if (isOutside && resolvedTarget !== resolvedRoot) {
    return null
  }

  return resolvedTarget as AbsolutePath
}

export function getImageMimeType(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase()
  return IMAGE_MIME_TYPES[ext] ?? "application/octet-stream"
}

export function isImageFile(filePath: string): boolean {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase()
  return ext in IMAGE_MIME_TYPES
}
