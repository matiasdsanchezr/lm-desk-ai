import "server-only"

import { config } from "@/shared/lib/config"
import { listDirectoryFiles } from "@/shared/services/file-service"
import { cacheLife, cacheTag } from "next/cache"
import type { FileTreeData } from "./types"
import { buildFileTree } from "./utils"

export async function getFileTree(): Promise<FileTreeData> {
  "use cache"
  cacheTag("file-tree")
  cacheLife("days")

  try {
    const filePaths = await listDirectoryFiles(config.TARGET_PROJECT_PATH)
    const treeNodes = buildFileTree(filePaths)
    return { totalFiles: filePaths.length, treeNodes }
  } catch (error) {
    console.error("Error en generateTreeStructure:", error)
    return { totalFiles: 0, treeNodes: [] }
  }
}
