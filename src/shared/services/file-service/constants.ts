import { Extension } from "./types"

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
  "__pycache__",
  "venv",
  ".venv",
])

export const ALLOWED_NON_CODE_EXTENSIONS = new Set<Extension>([
  // Documentación y Texto
  ".md",
  ".mdx",
  ".txt",
  ".rst",
  ".csv",
  ".tsv",

  // Configuración y Serialización
  ".json",
  ".jsonc",
  ".json5",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".cfg",
  ".xml",

  // Esquemas y DSLs
  ".graphql",
  ".gql",
  ".prisma",
  ".sql",
  ".proto",

  // Estilos y Vectores
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".svg",
])

export const IMAGE_EXTENSIONS = new Set<Extension>([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
])

export const IMAGE_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
}
