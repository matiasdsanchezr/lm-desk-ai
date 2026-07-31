"use server"

import { getFilePaths } from "@/services/file/utils"
import { ActionState } from "@/types/action-state"
import { buildFileTree } from "../services/tree-service"
import type { FileTreeNode } from "../types/file-tree-node"

interface TreeStructureResponse {
  totalFiles: number
  treeNodes: FileTreeNode[]
}

/**
 * Genera la estructura en árbol completa para la vista del explorador.
 */
export async function generateTreeStructure(): Promise<
  ActionState<TreeStructureResponse>
> {
  try {
    const filePaths = await getFilePaths()
    const treeNodes = buildFileTree(filePaths)
    return { data: { totalFiles: filePaths.length, treeNodes } }
  } catch (error) {
    return { error: "Error al generar la estructura del árbol" }
  }
}
