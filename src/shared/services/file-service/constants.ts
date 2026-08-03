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
  ".md",
  ".json",
  ".css",
  ".txt",
])

export const IMAGE_EXTENSIONS = new Set<Extension>([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
])
