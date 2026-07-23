"use server"

import { getFilePaths } from "@/services/file/utils"
import { buildFileTree } from "../services/tree-service"
import type { FileTreeNode } from "../types/file-tree-node"

interface TreeStructureResponse {
  totalFiles: number
  treeNodes: FileTreeNode[]
}

/**
 * Genera la estructura en árbol completa para la vista del explorador.
 */
export async function generateTreeStructure(): Promise<TreeStructureResponse> {
  const filePaths = await getFilePaths()
  const treeNodes = buildFileTree(filePaths)
  return { totalFiles: filePaths.length, treeNodes }
}
