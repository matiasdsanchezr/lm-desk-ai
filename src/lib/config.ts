import "server-only"

import path from "node:path"

const loadStoragePath = () => {
  const storagePath = process.env.STORAGE_PATH
  if (!storagePath) {
    console.warn("STORAGE_PATH no definido, usando directorio de trabajo actual")
    return path.join(process.cwd(), "storage")
  }
  return storagePath
}

const GENAI_API_KEY = process.env.GENAI_API_KEY
const VERTEX_API_KEY = process.env.VERTEX_API_KEY
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY
const NVIDIA_NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const TARGET_PROJECT_PATH = process.env.TARGET_PROJECT_PATH
const ANTIGRAVITY_BASE_URL = process.env.ANTIGRAVITY_BASE_URL
const ANTIGRAVITY_API_KEY = process.env.ANTIGRAVITY_API_KEY
const MODEL = process.env.MODEL
const STORAGE_PATH = loadStoragePath()

if (!TARGET_PROJECT_PATH)
  throw new Error("Se necesita el path del proyecto a analizar")
if (!MODEL) throw new Error("Modelo no especificado")

export const config = {
  TARGET_PROJECT_PATH,
  GENAI_API_KEY,
  VERTEX_API_KEY,
  OPEN_ROUTER_API_KEY,
  NVIDIA_NIM_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_API_KEY,
  MODEL,
  STORAGE_PATH,
  ANTIGRAVITY_BASE_URL,
  ANTIGRAVITY_API_KEY,
}
