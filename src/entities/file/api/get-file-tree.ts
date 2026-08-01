"use server"

import { getFilePaths } from "@/entities/file/lib/file-utils"
import { buildFileTree } from "@/entities/file/lib/tree-builder"
import type { ActionState } from "@/shared/types/action-state"
import { cacheLife } from "next/cache"
import { cache } from "react"
import type { TreeStructureResponse } from "../model/types"

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
