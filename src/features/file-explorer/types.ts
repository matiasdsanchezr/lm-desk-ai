export interface FileTreeNode {
  id: string
  name: string
  isFile: boolean
  filePath?: string
  children: FileTreeNode[]
}

export interface NodeState {
  checked: boolean
  indeterminate: boolean
}
