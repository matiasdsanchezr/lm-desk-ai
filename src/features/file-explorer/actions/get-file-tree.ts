"use server"

import { getFilePaths } from "@/shared/services/file-service/utils"
import { ActionState } from "@/shared/types/action-state"
import { cacheLife } from "next/cache"
import { cache } from "react"
import { buildFileTree } from "../services/tree-service"
import type { FileTreeNode } from "../types/file-tree-node"

interface TreeStructureResponse {
  totalFiles: number
  treeNodes: FileTreeNode[]
}

/**
 * Genera la estructura en árbol memorizada por request.
 */
export const generateTreeStructure = cache(
  async (): Promise<ActionState<TreeStructureResponse>> => {
    "use cache"
    cacheLife("hours")
    try {
      const filePaths = await getFilePaths()
      const treeNodes = buildFileTree(filePaths)
      return { data: { totalFiles: filePaths.length, treeNodes } }
    } catch (error) {
      console.error("Error en generateTreeStructure:", error)
      return { error: "Error al generar la estructura del árbol" }
    }
  }
)
