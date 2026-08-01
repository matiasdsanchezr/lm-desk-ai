import "server-only"

import path from "node:path"

const loadStoragePath = () => {
  const storagePath = process.env.STORAGE_PATH
  if (!storagePath) {
    console.warn(
      "STORAGE_PATH no definido, usando directorio `storage` del proyecto"
    )
    return path.join(process.cwd(), "storage")
  }
  return storagePath
}

const loadTargetProjectPath = () => {
  const targetPath = process.env.TARGET_PROJECT_PATH
  if (!targetPath) {
    console.warn(
      "TARGET_PROJECT_PATH no definido, usando directorio del proyecto"
    )
    return process.cwd()
  }
  return targetPath
}

const GENAI_API_KEY = process.env.GENAI_API_KEY
const VERTEX_API_KEY = process.env.VERTEX_API_KEY
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY
const NVIDIA_NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY
const ANTIGRAVITY_BASE_URL = process.env.ANTIGRAVITY_BASE_URL
const ANTIGRAVITY_API_KEY = process.env.ANTIGRAVITY_API_KEY
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const STORAGE_PATH = loadStoragePath()
const TARGET_PROJECT_PATH = loadTargetProjectPath()

if (!TARGET_PROJECT_PATH) {
  throw new Error("Se necesita el path del proyecto a analizar")
}

export const config = {
  TARGET_PROJECT_PATH,
  GENAI_API_KEY,
  VERTEX_API_KEY,
  OPEN_ROUTER_API_KEY,
  NVIDIA_NIM_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_API_KEY,
  STORAGE_PATH,
  ANTIGRAVITY_BASE_URL,
  ANTIGRAVITY_API_KEY,
}
