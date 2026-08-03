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
