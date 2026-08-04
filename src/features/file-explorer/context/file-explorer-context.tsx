"use client"

import { ActionResponse } from "@/shared/types/action-state"
import { createContext, use, useContext, useMemo } from "react"
import type { FileTreeData, FileTreeNode } from "../types"

interface FileExplorerContextValue {
  treeNodes: FileTreeNode[]
  totalFiles: number
}

const FileExplorerContext = createContext<FileExplorerContextValue | null>(null)

interface FileExplorerProviderProps {
  fileTreePromise: ActionResponse<FileTreeData>
  children: React.ReactNode
}

export function FileExplorerProvider({
  fileTreePromise,
  children,
}: FileExplorerProviderProps) {
  const fileTreeResponse = use(fileTreePromise)

  if (fileTreeResponse.error || !fileTreeResponse.data) {
    throw new Error(
      fileTreeResponse.error || "Error al cargar la estructura de archivos"
    )
  }

  const value = useMemo<FileExplorerContextValue>(
    () => ({
      treeNodes: fileTreeResponse.data?.treeNodes ?? [],
      totalFiles: fileTreeResponse.data?.totalFiles ?? 0,
    }),
    [fileTreeResponse.data?.treeNodes, fileTreeResponse.data?.totalFiles]
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
