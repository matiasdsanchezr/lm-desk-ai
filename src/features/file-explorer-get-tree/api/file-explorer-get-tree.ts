"use server"

import { getFilePaths } from "@/entities/file"
import type { ActionState } from "@/shared/types/action-state"
import { cacheLife } from "next/cache"
import { cache } from "react"
import { buildFileTree } from "../lib/file-explorer-get-tree-utils"
import type { TreeStructureResponse } from "../../../widgets/file-explorer/model/file-explorer-get-tree-types"

export const fileExplorerGetTree = cache(
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
