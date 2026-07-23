import type { FileTreeNode } from "@/features/file-explorer/types/file-tree-node"

function getCommonRootDirectory(paths: string[]): string {
  if (!paths.length) return ""
  const segmentedPaths = paths.map((p) => p.split("/"))
  const minLen = Math.min(...segmentedPaths.map((s) => s.length))
  const common: string[] = []

  for (let i = 0; i < minLen; i++) {
    const segment = segmentedPaths[0]?.[i]
    if (segment && segmentedPaths.every((s) => s[i] === segment)) {
      common.push(segment)
    } else {
      break
    }
  }
  return common.join("/")
}

/**
 * Ordena nodos jerárquicos de forma pura: primero directorios, luego archivos (alfabéticamente).
 */
function sortTreeNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.isFile === b.isFile) {
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      }
      return a.isFile ? 1 : -1
    })
    .map((node) => ({
      ...node,
      children: node.isFile ? [] : sortTreeNodes(node.children),
    }))
}

/**
 * Convierte una lista plana de rutas en un árbol jerárquico inmutable de FileTreeNode.
 */
export function buildFileTree(filePaths: string[]): FileTreeNode[] {
  if (!filePaths || filePaths.length === 0) return []

  const base = getCommonRootDirectory(filePaths)
  const roots: FileTreeNode[] = []
  const nodeMap = new Map<string, FileTreeNode>()

  filePaths.forEach((absPath) => {
    const relative = absPath.slice(base.length).replace(/^\//, "")
    const parts = relative.split("/").filter(Boolean)

    let parentNode: FileTreeNode | undefined

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1
      const nodeId = base
        ? `${base}/${parts.slice(0, i + 1).join("/")}`
        : parts.slice(0, i + 1).join("/")

      if (!nodeMap.has(nodeId)) {
        const newNode: FileTreeNode = {
          id: nodeId,
          name: part,
          isFile,
          children: [],
          filePath: isFile ? absPath : undefined,
        }
        nodeMap.set(nodeId, newNode)

        if (parentNode) {
          parentNode.children.push(newNode)
        } else if (i === 0) {
          roots.push(newNode)
        }
      }
      parentNode = nodeMap.get(nodeId)
    })
  })

  return sortTreeNodes(roots)
}
