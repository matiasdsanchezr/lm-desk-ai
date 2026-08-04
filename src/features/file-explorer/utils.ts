import { ImageFile } from "@/shared/types/image-file"
import type { FileTreeNode } from "./types"

export function getCommonBasePath(paths: string[]): string {
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

export function sortFileTreeNodes(nodes: FileTreeNode[]): FileTreeNode[] {
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
      children: node.isFile ? [] : sortFileTreeNodes(node.children),
    }))
}

export function buildFileTree(filePaths: string[]): FileTreeNode[] {
  if (!filePaths || filePaths.length === 0) return []

  const base = getCommonBasePath(filePaths)
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

  return sortFileTreeNodes(roots)
}

export const fetchRemoteImageAsBase64 = async (
  src: string
): Promise<ImageFile> => {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Error al cargar la imagen con URL: ${src}`)
  }

  const mime =
    response.headers.get("content-type") || response.headers.get("Content-Type")

  if (!mime || !mime.startsWith("image/")) {
    throw new Error(`Error al cargar la imagen, MIME inválido. URL: ${src}`)
  }

  const imageArrayBuffer = await response.arrayBuffer()
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64")

  return { mimeType: mime, base64: base64ImageData }
}
