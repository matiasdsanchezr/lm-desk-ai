export type AbsolutePath = string & { readonly __brand: unique symbol }

export type Extension = `.${string}`

export interface LanguageStrategy {
  readonly extensions: ReadonlySet<Extension>
  extractImports(content: string): string[]
  resolveImport(
    importSpecifier: string,
    currentFile: AbsolutePath,
    projectRoot: AbsolutePath
  ): Promise<AbsolutePath | null>
}

export type FileContent = {
  path: string
  content?: string
  error?: string
  dependencies?: string[]
  language?: string
}

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

export interface TreeStructureResponse {
  totalFiles: number
  treeNodes: FileTreeNode[]
}
