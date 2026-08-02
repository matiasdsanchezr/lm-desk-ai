import { config } from "@/shared/lib/config"
import type { UIMessage } from "@ai-sdk/react"
import { mkdir } from "fs/promises"
import path from "path"
import type { ChatTurn } from "../model/types"

export const GENERATED_DIR = path.join(config.STORAGE_PATH, "chats")

export async function ensureDirectoryExists() {
  await mkdir(GENERATED_DIR, { recursive: true })
}

