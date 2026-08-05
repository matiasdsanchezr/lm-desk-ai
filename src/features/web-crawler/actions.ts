"use server"

import { scrapeUrlsWithPlaywright } from "./lib/playwright-crawler"
import type { CrawledPageNode } from "./types"

interface CrawlResponse {
  data?: CrawledPageNode[]
  error?: string
}

export async function crawlPagesAction(urls: string[]): Promise<CrawlResponse> {
  try {
    if (!urls || urls.length === 0) {
      return { error: "No se proporcionaron URLs para rastrear." }
    }

    const validUrls = urls
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"))

    if (validUrls.length === 0) {
      return {
        error: "Formato de URLs inválido. Deben iniciar con http:// o https://",
      }
    }

    const results = await scrapeUrlsWithPlaywright(validUrls)
    return { data: results }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error inesperado al ejecutar el rastro web.",
    }
  }
}
