import { config } from "@/lib/config"
import { AbsolutePath, Extension } from "./types"
import path from "node:path"
import { FileContent } from "@/types/file-content"
import { cache } from "react"
import { ALLOWED_EXTENSIONS, STRATEGY_BY_EXTENSION } from "./strategies"
import fs from "node:fs/promises"

export class FileService {
  private projectRoot: AbsolutePath
  private readonly CONCURRENCY_LIMIT = 20

  constructor(projectRoot: string = config.TARGET_PROJECT_PATH) {
    this.projectRoot = path.resolve(projectRoot) as AbsolutePath
  }

  async getFileContentsWithDependencies(
    paths: string[]
  ): Promise<FileContent[]> {
    const uniquePaths = Array.from(
      new Set(
        paths.map((p) => path.resolve(this.projectRoot, p) as AbsolutePath)
      )
    )
    const results: FileContent[] = []

    for (let i = 0; i < uniquePaths.length; i += this.CONCURRENCY_LIMIT) {
      const batch = uniquePaths.slice(i, i + this.CONCURRENCY_LIMIT)
      const batchResults = await Promise.all(
        batch.map((p) => this.processFile(p))
      )
      results.push(...batchResults)
    }

    return results
  }

  private processFile = cache(
    async (currentPath: AbsolutePath): Promise<FileContent> => {
      const ext = path.extname(currentPath).toLowerCase() as Extension

      if (!currentPath.startsWith(this.projectRoot)) {
        return {
          path: currentPath,
          error: "Security: Outside root",
        }
      }

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return {
          path: currentPath,
          error: `Forbidden extension: ${ext}`,
        }
      }

      try {
        const content = await fs.readFile(currentPath, "utf-8")
        const dependencies = new Set<string>()

        // Obtener la estrategia correspondiente al archivo actual
        const strategy = STRATEGY_BY_EXTENSION.get(ext)

        if (strategy) {
          const specifiers = strategy.extractImports(content)

          for (const specifier of specifiers) {
            const resolved = await strategy.resolveImport(
              specifier,
              currentPath,
              this.projectRoot
            )
            if (resolved) {
              dependencies.add(resolved)
            }
          }
        }

        const fileData: FileContent = {
          path: currentPath,
          content,
          dependencies: Array.from(dependencies),
          language: ext.slice(1),
        }

        return { ...fileData }
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

  loadProjectGraph = cache(
    async (
      entryPoints: string[],
      includeDeps = true
    ): Promise<FileContent[]> => {
      const resolvedEntryPoints = entryPoints.map(
        (p) => path.resolve(this.projectRoot, p) as AbsolutePath
      )
      const visited = new Set<AbsolutePath>()
      const results = new Map<AbsolutePath, FileContent>()
      let nodesToProcess: AbsolutePath[] = resolvedEntryPoints

      while (nodesToProcess.length > 0) {
        const toProcess = nodesToProcess.filter((p) => !visited.has(p))
        nodesToProcess = []
        if (toProcess.length === 0) break

        toProcess.forEach((p) => visited.add(p))
        const processedFiles =
          await this.getFileContentsWithDependencies(toProcess)

        for (const file of processedFiles) {
          const absPath = file.path as AbsolutePath
          results.set(absPath, file)

          if (includeDeps && file.dependencies) {
            for (const dep of file.dependencies) {
              if (!visited.has(dep as AbsolutePath))
                nodesToProcess.push(dep as AbsolutePath)
            }
          }
        }
        if (!includeDeps) break
      }

      return Array.from(results.values()).map((file) => ({
        ...file,
        path: path.relative(this.projectRoot, file.path).replace(/\\/g, "/"),
        dependencies: file.dependencies?.map((dep) =>
          path.relative(this.projectRoot, dep).replace(/\\/g, "/")
        ),
      }))
    }
  )
}

export const fileService = new FileService()