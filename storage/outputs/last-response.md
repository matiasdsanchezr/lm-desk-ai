Para lograr que el cliente **solo reciba y visualice rutas relativas** basadas en el directorio `STORAGE_PATH` (ocultando la estructura absoluta del servidor por seguridad y estética), debes realizar modificaciones en la configuración y en el servicio de archivos.

Aquí tienes los cambios detallados y las partes del código que debes modificar.

---

### 1. Breve Explicación Técnica

1. **`src/lib/config.ts`**: Eliminamos la obligatoriedad de `TARGET_PROJECT_PATH` si ya no se va a usar como la raíz del proyecto, priorizando `STORAGE_PATH` como el directorio de trabajo y análisis.
2. **`src/services/file-service.tsx`**:
   * Cambiamos el constructor de `FileService` para inicializarse por defecto con `config.STORAGE_PATH`.
   * Modificamos `getFilePaths` para que busque dentro de `STORAGE_PATH` y **retorne únicamente rutas relativas** (usando `path.relative`).
   * Modificamos el procesamiento de grafos y dependencias para que acepte rutas relativas desde el cliente, las resuelva internamente como absolutas para leer el disco, y las devuelva al cliente transformadas nuevamente en relativas.

---

### 2. Bloques de Código Modificados

#### Modificación en la Configuración
`src/lib/config.ts`
```typescript
// /home/matias/documentos/ts/lm-desk-ai/src/lib/config.ts

import "server-only"

import {
  InferenceProvider,
  InferenceProviderEnum,
} from "@/services/inference/schemas/provider-schema"
import path from "node:path"

const loadStoragePath = () => {
  const storagePath = process.env.STORAGE_PATH
  if (!storagePath) {
    console.warn(
      'STORAGE_PATH no definido, usando path.join(process.cwd(), "storage")'
    )
    return path.join(process.cwd(), "storage")
  }
  return storagePath
}

const loadAiProvider = (): InferenceProvider => {
  const aiProvider = InferenceProviderEnum.safeParse(process.env.AI_PROVIDER)
  if (!aiProvider.success) {
    console.warn("AI_PROVIDER no definido, usando vertex")
    return "vertex"
  }
  return aiProvider.data
}

const GENAI_API_KEY = process.env.GENAI_API_KEY
const VERTEX_API_KEY = process.env.VERTEX_API_KEY
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY
const NVIDIA_NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const TARGET_PROJECT_PATH = process.env.TARGET_PROJECT_PATH // Opcional ahora
const ANTIGRAVITY_BASE_URL = process.env.ANTIGRAVITY_BASE_URL
const ANTIGRAVITY_API_KEY = process.env.ANTIGRAVITY_API_KEY
const MODEL = process.env.MODEL
const AI_PROVIDER = loadAiProvider()
const STORAGE_PATH = loadStoragePath()

// CAMBIO: Validar STORAGE_PATH en lugar de obligar a TARGET_PROJECT_PATH
if (!STORAGE_PATH) throw new Error("Se necesita el STORAGE_PATH para almacenar y analizar archivos")
if (!AI_PROVIDER) throw new Error("Proveedor no especificado")
if (!MODEL) throw new Error("Modelo no especificado")

export const config = {
  TARGET_PROJECT_PATH,
  GENAI_API_KEY,
  VERTEX_API_KEY,
  OPEN_ROUTER_API_KEY,
  NVIDIA_NIM_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_API_KEY,
  AI_PROVIDER,
  MODEL,
  STORAGE_PATH,
  ANTIGRAVITY_BASE_URL,
  ANTIGRAVITY_API_KEY,
}
```

#### Modificación en el Servicio de Archivos
`src/services/file-service.tsx`
```typescript
// /home/matias/documentos/ts/lm-desk-ai/src/services/file-service.tsx

import { config } from "@/lib/config"
import { FileContent } from "@/types/file-content"
import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"

type AbsolutePath = string & { readonly __brand: unique symbol }
type Extension = `.${string}`

export const DEFAULT_IGNORE = new Set([
  "node_modules",
  ".idea",
  ".vscode",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  ".yalc",
  "__tests__",
])

const CODE_EXTENSIONS: ReadonlySet<Extension> = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".jsx",
  ".py",
])
const ALLOWED_EXTENSIONS: ReadonlySet<Extension> = new Set([
  ...CODE_EXTENSIONS,
  ".md",
  ".json",
  ".css",
])

const IMPORT_REGEX =
  /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g

export class FileService {
  private projectRoot: AbsolutePath
  private resolutionCache = new Map<string, AbsolutePath | null>()
  private readonly CONCURRENCY_LIMIT = 20

  // CAMBIO: Inicializar con STORAGE_PATH por defecto
  constructor(projectRoot: string = config.STORAGE_PATH) {
    this.projectRoot = path.resolve(projectRoot) as AbsolutePath
  }

  private resolveImportPath(
    baseFile: AbsolutePath,
    modulePath: string
  ): AbsolutePath | null {
    if (modulePath.startsWith("./") || modulePath.startsWith("../")) {
      return path.resolve(path.dirname(baseFile), modulePath) as AbsolutePath
    }
    if (modulePath.startsWith("@workspace/")) {
      return path.resolve(
        this.projectRoot,
        "..",
        "..",
        "packages",
        "ui",
        "src",
        modulePath.slice(2)
      ) as AbsolutePath
    }
    if (modulePath.startsWith("@/")) {
      return path.resolve(
        this.projectRoot,
        "src",
        modulePath.slice(2)
      ) as AbsolutePath
    }
    if (modulePath.startsWith("/")) {
      return path.resolve(this.projectRoot, modulePath.slice(1)) as AbsolutePath
    }
    return null
  }

  private async resolveWithExtensions(
    basePath: AbsolutePath
  ): Promise<AbsolutePath | null> {
    if (this.resolutionCache.has(basePath))
      return this.resolutionCache.get(basePath)!

    const ext = path.extname(basePath) as Extension
    const candidates: string[] = CODE_EXTENSIONS.has(ext)
      ? [basePath]
      : Array.from(CODE_EXTENSIONS).flatMap((ext) => [
          `${basePath}${ext}`,
          path.join(basePath, `index${ext}`),
        ])

    for (const candidate of candidates) {
      try {
        await fs.access(candidate)
        const resolved = candidate as AbsolutePath
        this.resolutionCache.set(basePath, resolved)
        return resolved
      } catch {
        continue
      }
    }

    this.resolutionCache.set(basePath, null)
    return null
  }

  async getFileContentsWithDependencies(
    paths: string[]
  ): Promise<FileContent[]> {
    // CAMBIO: Las rutas entrantes ahora son relativas, las resolvemos a absolutas para procesar en el servidor
    const uniquePaths = Array.from(
      new Set(paths.map((p) => path.resolve(this.projectRoot, p) as AbsolutePath))
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
          path: path.relative(this.projectRoot, currentPath).replace(/\\/g, "/"),
          error: "Security: Outside root",
        }
      }

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return {
          path: path.relative(this.projectRoot, currentPath).replace(/\\/g, "/"),
          error: `Forbidden extension: ${ext}`,
        }
      }

      try {
        const content = await fs.readFile(currentPath, "utf-8")
        const dependencies = new Set<string>()

        if (CODE_EXTENSIONS.has(ext)) {
          const matches = [...content.matchAll(IMPORT_REGEX)]
          const specifiers = matches
            .map((match) => match[1] || match[2])
            .filter(Boolean)

          for (const specifier of specifiers) {
            const potentialPath = this.resolveImportPath(
              currentPath,
              specifier!
            )
            if (potentialPath) {
              const resolved = await this.resolveWithExtensions(potentialPath)
              if (resolved) dependencies.add(resolved)
            }
          }
        }

        // CAMBIO: Devolver todas las rutas al cliente en formato relativo
        const relativePath = path.relative(this.projectRoot, currentPath).replace(/\\/g, "/")
        const relativeDeps = Array.from(dependencies).map((dep) =>
          path.relative(this.projectRoot, dep).replace(/\\/g, "/")
        )

        return {
          path: relativePath,
          content,
          dependencies: relativeDeps,
          language: ext.slice(1),
        }
      } catch (err) {
        return {
          path: path.relative(this.projectRoot, currentPath).replace(/\\/g, "/"),
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
      const visited = new Set<AbsolutePath>()
      const results = new Map<AbsolutePath, FileContent>()
      
      // CAMBIO: Resolver las rutas relativas de entrada a absolutas para el bucle de procesamiento
      let nodesToProcess: AbsolutePath[] = entryPoints.map(
        (p) => path.resolve(this.projectRoot, p) as AbsolutePath
      )

      while (nodesToProcess.length > 0) {
        const toProcess = nodesToProcess.filter((p) => !visited.has(p))
        nodesToProcess = []
        if (toProcess.length === 0) break

        toProcess.forEach((p) => visited.add(p))
        const processedFiles =
          await this.getFileContentsWithDependencies(toProcess)

        for (const file of processedFiles) {
          // Re-resolver a ruta absoluta para mantener consistencia en el Set del servidor
          const absPath = path.resolve(this.projectRoot, file.path) as AbsolutePath
          results.set(absPath, file)

          if (includeDeps && file.dependencies) {
            for (const dep of file.dependencies) {
              const absDep = path.resolve(this.projectRoot, dep) as AbsolutePath
              if (!visited.has(absDep)) {
                nodesToProcess.push(absDep)
              }
            }
          }
        }
        if (!includeDeps) break
      }
      return Array.from(results.values())
    }
  )
}

export const fileService = new FileService()

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

// CAMBIO: Cambiar la ruta base por defecto y mapear las rutas absolutas encontradas a relativas
export const getFilePaths = cache(
  async (
    folder: string = config.STORAGE_PATH,
    extensions: ReadonlySet<Extension> = ALLOWED_EXTENSIONS,
    ignore: string[] = Array.from(DEFAULT_IGNORE)
  ) => {
    const resolvedFolder = path.resolve(folder)
    const stat = await fs.stat(resolvedFolder).catch(() => null)
    if (!stat?.isDirectory()) throw new Error(`Path inválido: ${resolvedFolder}`)
    
    const absolutePaths = await recursiveFileSearch(resolvedFolder, extensions, new Set(ignore))
    
    // Mapeamos a relativas antes de mandarlas al cliente
    return absolutePaths.map((p) => path.relative(resolvedFolder, p).replace(/\\/g, "/"))
  }
)
```

---

### 3. Impacto en otros componentes

Al realizar esta conversión a nivel de infraestructura (`fileService`), no necesitas reescribir la UI:
* El **File Tree Explorer** automáticamente construirá las carpetas a partir de las rutas relativas (ej. `src/app/page.tsx`).
* El **Editor de menciones Lexical** insertará menciones del tipo `@page.tsx` con su `filePath` asociado como relativo (`src/app/page.tsx`).
* Las llamadas a las Server Actions (`getFileContents`) seguirán enviando rutas relativas que el servidor interpretará y procesará de forma segura.