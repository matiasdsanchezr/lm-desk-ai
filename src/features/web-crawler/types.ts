export interface CrawledPageNode {
  url: string
  title: string
  domain: string
  content?: string
  status: "pending" | "crawling" | "success" | "error"
  errorMessage?: string
}

export interface WebCrawlerStoreState {
  inputUrls: string
  maxDepth: number
  maxPages: number
  crawledPages: CrawledPageNode[]
  selectedUrls: string[]
  isCrawling: boolean
  setInputUrls: (urls: string) => void
  setMaxDepth: (depth: number) => void
  setMaxPages: (pages: number) => void
  setCrawledPages: (pages: CrawledPageNode[]) => void
  setSelectedUrls: (urls: string[]) => void
  toggleUrlSelection: (url: string) => void
  selectAllPages: () => void
  clearSelectedUrls: () => void
  setIsCrawling: (isCrawling: boolean) => void
  resetState: () => void
}
