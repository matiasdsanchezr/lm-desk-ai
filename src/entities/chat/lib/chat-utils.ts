import { config } from "@/shared/lib/config"
import { mkdir } from "fs/promises"
import path from "path"

export const GENERATED_DIR = path.join(config.STORAGE_PATH, "chats")

export async function ensureDirectoryExists() {
  await mkdir(GENERATED_DIR, { recursive: true })
}
