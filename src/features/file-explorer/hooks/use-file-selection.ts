"use client"

import { useCallback, useMemo } from "react"
import { useFileExplorerContext } from "../context/file-explorer-context"
import type { FileTreeNode, TreeNodeSelectionState } from "../types"

interface UseFileSelectionOptions {
  selectedFilePaths: string[]
  onSelectionChange: (files: string[]) => void
}

export function useFileSelection({
  selectedFilePaths,
  onSelectionChange,
}: UseFileSelectionOptions) {
  const { treeNodes } = useFileExplorerContext()

  const { folderFilesMap, fileAncestorsMap } = useMemo(() => {
    const folderFilesMap = new Map<string, string[]>()
    const fileAncestorsMap = new Map<string, string[]>()

    const buildTreeLookupMaps = (
      node: FileTreeNode,
      parentFolders: string[]
    ): string[] => {
      if (node.isFile) {
        const path = node.filePath ?? ""
        fileAncestorsMap.set(path, parentFolders)
        return [path]
      }

      const currentPathFolders = [...parentFolders, node.id]
      const filesInChildren = node.children.flatMap((child) =>
        buildTreeLookupMaps(child, currentPathFolders)
      )

      if (filesInChildren.length > 0) {
        folderFilesMap.set(node.id, filesInChildren)
      }
      return filesInChildren
    }

    treeNodes.forEach((rootNode) => buildTreeLookupMaps(rootNode, []))

    return {
      folderFilesMap,
      fileAncestorsMap,
    }
  }, [treeNodes])

  const selectedSet = useMemo(
    () => new Set(selectedFilePaths),
    [selectedFilePaths]
  )
  const folderSelectionCounts = useMemo(() => {
    const counts = new Map<string, number>()

    selectedFilePaths.forEach((filePath) => {
      const parentFolders = fileAncestorsMap.get(filePath) || []
      parentFolders.forEach((folderId) => {
        counts.set(folderId, (counts.get(folderId) || 0) + 1)
      })
    })

    return counts
  }, [selectedFilePaths, fileAncestorsMap])

  const getNodeSelectionState = useCallback(
    (node: FileTreeNode): TreeNodeSelectionState => {
      if (node.isFile) {
        return {
          checked: selectedSet.has(node.filePath ?? ""),
          indeterminate: false,
        }
      }

      const totalFilesInFolder = folderFilesMap.get(node.id)?.length ?? 0
      if (totalFilesInFolder === 0) {
        return { checked: false, indeterminate: false }
      }

      const selectedCount = folderSelectionCounts.get(node.id) ?? 0

      return {
        checked: selectedCount === totalFilesInFolder,
        indeterminate: selectedCount > 0 && selectedCount < totalFilesInFolder,
      }
    },
    [selectedSet, folderFilesMap, folderSelectionCounts]
  )

  const toggleNodeSelection = useCallback(
    (node: FileTreeNode) => {
      if (node.isFile) {
        const filePath = node.filePath
        if (!filePath) return

        const isSelected = selectedSet.has(filePath)
        onSelectionChange(
          isSelected
            ? selectedFilePaths.filter((f) => f !== filePath)
            : [...selectedFilePaths, filePath]
        )
      } else {
        const filesInFolder = folderFilesMap.get(node.id) ?? []
        if (filesInFolder.length === 0) return

        const selectedCount = folderSelectionCounts.get(node.id) ?? 0
        const allSelected = selectedCount === filesInFolder.length

        if (allSelected) {
          const folderFilesSet = new Set(filesInFolder)
          onSelectionChange(
            selectedFilePaths.filter((f) => !folderFilesSet.has(f))
          )
        } else {
          const newFiles = filesInFolder.filter((f) => !selectedSet.has(f))
          onSelectionChange([...selectedFilePaths, ...newFiles])
        }
      }
    },
    [
      selectedFilePaths,
      selectedSet,
      onSelectionChange,
      folderFilesMap,
      folderSelectionCounts,
    ]
  )

  const clearSelectedFilePaths = useCallback(() => {
    onSelectionChange([])
  }, [onSelectionChange])

  return {
    selectedSet,
    getNodeSelectionState,
    toggleNodeSelection,
    clearSelectedFilePaths,
    selectedFilesCount: selectedFilePaths.length,
  }
}
