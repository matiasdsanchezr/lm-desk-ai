"use server"

import { config } from "@/shared/lib/config"
import { listDirectoryFiles } from "@/shared/services/file-service"
import { ActionResponse } from "@/shared/types/action-state"
import { cacheLife } from "next/cache"
import { cache } from "react"
import { buildFileTree } from "../services/file-explorer-service"
import type { TreeStructureResponse } from "../types"

/**
 * Genera la estructura en árbol memorizada por request.
 */
export const generateTreeStructure = cache(
  async (): ActionResponse<TreeStructureResponse> => {
    "use cache"
    cacheLife("hours")
    try {
      const filePaths = await listDirectoryFiles(config.TARGET_PROJECT_PATH)
      const treeNodes = buildFileTree(filePaths)
      return { data: { totalFiles: filePaths.length, treeNodes } }
    } catch (error) {
      console.error("Error en generateTreeStructure:", error)
      return { error: "Error al generar la estructura del árbol" }
    }
  }
)
