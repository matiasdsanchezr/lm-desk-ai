"use client"

import { useTransition } from "react"
import { crawlPagesAction } from "../actions"
import { useWebCrawlerStore } from "../store/web-crawler-store"

export function useCrawlAction() {
  const [isPending, startTransition] = useTransition()
  const inputUrls = useWebCrawlerStore((s) => s.inputUrls)
  const setCrawledPages = useWebCrawlerStore((s) => s.setCrawledPages)
  const selectAllPages = useWebCrawlerStore((s) => s.selectAllPages)
  const setIsCrawling = useWebCrawlerStore((s) => s.setIsCrawling)

  const handleStartCrawl = () => {
    const urlsArray = inputUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)

    if (urlsArray.length === 0) return

    setIsCrawling(true)

    startTransition(async () => {
      try {
        const response = await crawlPagesAction(urlsArray)
        if (response.data) {
          setCrawledPages(response.data)
          selectAllPages()
        }
      } finally {
        setIsCrawling(false)
      }
    })
  }

  return {
    handleStartCrawl,
    isLoading: isPending,
  }
}
