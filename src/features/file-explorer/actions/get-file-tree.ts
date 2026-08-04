"use server"

import { config } from "@/shared/lib/config"
import { listDirectoryFiles } from "@/shared/services/file-service"
import { ActionResponse } from "@/shared/types/action-state"
import { cache } from "react"
import type { FileTreeData } from "../types"
import { buildFileTree } from "../utils"

export const getFileTreeAction = cache(
  async (): ActionResponse<FileTreeData> => {
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
