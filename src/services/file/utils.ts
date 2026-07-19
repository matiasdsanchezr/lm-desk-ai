import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import { config } from "@/lib/config"
import { Extension } from "./types"
import { DEFAULT_IGNORE } from "./constants"
import { ALLOWED_EXTENSIONS } from "./strategies"

async function recursiveFileSearch(
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
