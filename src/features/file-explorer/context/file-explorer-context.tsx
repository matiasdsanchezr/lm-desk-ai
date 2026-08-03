"use client"

import { ActionState } from "@/shared/types/action-state"
import { createContext, use, useContext, useMemo } from "react"
import type { FileTreeNode, TreeStructureResponse } from "../types"

interface FileExplorerContextValue {
  treeNodes: FileTreeNode[]
  totalFiles: number
}

const FileExplorerContext = createContext<FileExplorerContextValue | null>(null)

interface FileExplorerProviderProps {
  treeStructurePromise: Promise<ActionState<TreeStructureResponse>>
  children: React.ReactNode
}

export function FileExplorerProvider({
  treeStructurePromise,
  children,
}: FileExplorerProviderProps) {
  const treeStructure = use(treeStructurePromise)

  if (treeStructure.error || !treeStructure.data) {
    throw new Error(
      treeStructure.error || "Error al cargar la estructura de archivos"
    )
  }

  const value = useMemo<FileExplorerContextValue>(
    () => ({
      treeNodes: treeStructure.data?.treeNodes ?? [],
      totalFiles: treeStructure.data?.totalFiles ?? 0,
    }),
    [treeStructure.data?.treeNodes, treeStructure.data?.totalFiles]
  )

  return <FileExplorerContext value={value}>{children}</FileExplorerContext>
}

export function useFileExplorerContext(): FileExplorerContextValue {
  const context = useContext(FileExplorerContext)
  if (!context) {
    throw new Error(
      "useFileExplorerContext debe ser utilizado dentro de un FileExplorerProvider"
    )
  }
  return context
}
