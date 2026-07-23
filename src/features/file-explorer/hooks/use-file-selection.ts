"use client"

import { useCallback, useMemo } from "react"
import type { FileTreeNode } from "../types/file-tree-node"
import type { NodeState } from "../types/node-state"

interface UseFileSelectionOptions {
  treeNodes: FileTreeNode[]
  selectedFiles: string[]
  onSelectionChange: (files: string[]) => void
}

export function useFileSelection({
  treeNodes,
  selectedFiles,
  onSelectionChange,
}: UseFileSelectionOptions) {
  const folderToFiles = useMemo(() => {
    const map = new Map<string, string[]>()

    const collectFiles = (node: FileTreeNode): string[] => {
      if (node.isFile) {
        return node.filePath ? [node.filePath] : []
      }

      const files = node.children.flatMap(collectFiles)
      if (files.length > 0) {
        map.set(node.id, files)
      }
      return files
    }

    treeNodes.forEach(collectFiles)
    return map
  }, [treeNodes])

  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])

  const getNodeState = useCallback(
    (node: FileTreeNode): NodeState => {
      if (node.isFile) {
        return {
          checked: selectedSet.has(node.filePath ?? ""),
          indeterminate: false,
        }
      }

      const files = folderToFiles.get(node.id) ?? []
      if (files.length === 0) {
        return { checked: false, indeterminate: false }
      }

      const selectedCount = files.filter((f) => selectedSet.has(f)).length

      return {
        checked: selectedCount === files.length,
        indeterminate: selectedCount > 0 && selectedCount < files.length,
      }
    },
    [selectedSet, folderToFiles]
  )

  const toggleFile = useCallback(
    (node: FileTreeNode) => {
      if (node.isFile) {
        const filePath = node.filePath
        if (!filePath) return

        const isSelected = selectedSet.has(filePath)
        onSelectionChange(
          isSelected
            ? selectedFiles.filter((f) => f !== filePath)
            : [...selectedFiles, filePath]
        )
      } else {
        const files = folderToFiles.get(node.id) ?? []
        if (files.length === 0) return

        const allSelected = files.every((f) => selectedSet.has(f))

        if (allSelected) {
          onSelectionChange(selectedFiles.filter((f) => !files.includes(f)))
        } else {
          const newFiles = files.filter((f) => !selectedSet.has(f))
          onSelectionChange([...selectedFiles, ...newFiles])
        }
      }
    },
    [selectedFiles, selectedSet, onSelectionChange, folderToFiles]
  )

  const clearSelection = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  return {
    selectedSet,
    folderToFiles,
    getNodeState,
    toggleFile,
    clearSelection,
    totalSelected: selectedFiles.length,
  }
}
