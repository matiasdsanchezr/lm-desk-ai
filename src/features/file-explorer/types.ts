export interface FileTreeNode {
  id: string
  name: string
  isFile: boolean
  filePath?: string
  children: FileTreeNode[]
}

export interface TreeNodeSelectionState {
  checked: boolean
  indeterminate: boolean
}

export interface FileTreeData {
  totalFiles: number
  treeNodes: FileTreeNode[]
}
