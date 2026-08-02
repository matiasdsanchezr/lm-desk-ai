import fs from "node:fs/promises"
import path from "node:path"
import { AbsolutePath, LanguageStrategy } from "../model/file-types"

const JS_TS_IMPORT_REGEX =
  /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*/g

export const jsTsStrategy: LanguageStrategy = {
  extensions: new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]),

  extractImports(content: string): string[] {
    const matches = [...content.matchAll(JS_TS_IMPORT_REGEX)]
    return matches
      .map((match) => match[1] || match[2])
      .filter((specifier): specifier is string => Boolean(specifier))
  },

  async resolveImport(importSpecifier, currentFile, projectRoot) {
    let resolvedPath: string | null = null

    if (importSpecifier.startsWith("./") || importSpecifier.startsWith("../")) {
      resolvedPath = path.resolve(path.dirname(currentFile), importSpecifier)
    } else if (importSpecifier.startsWith("@workspace/")) {
      resolvedPath = path.resolve(
        projectRoot,
        "..",
        "..",
        "packages",
        "ui",
        "src",
        importSpecifier.slice(11)
      )
    } else if (importSpecifier.startsWith("@/")) {
      resolvedPath = path.resolve(projectRoot, "src", importSpecifier.slice(2))
    } else if (importSpecifier.startsWith("/")) {
      resolvedPath = path.resolve(projectRoot, importSpecifier.slice(1))
    }

    if (!resolvedPath) return null

    const candidates = [
      resolvedPath,
      ...Array.from(this.extensions).flatMap((ext) => [
        `${resolvedPath}${ext}`,
        path.join(resolvedPath!, `index${ext}`),
      ]),
    ]

    for (const candidate of candidates) {
      try {
        const stat = await fs.stat(candidate)
        if (stat.isFile()) {
          return candidate as AbsolutePath
        }
      } catch {
        continue
      }
    }

    return null
  },
}
