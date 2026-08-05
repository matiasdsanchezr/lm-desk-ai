"use client"

import { Button } from "@/shared/components/ui/button"
import { useState } from "react"
import { useWebCrawlerStore } from "../store/web-crawler-store"
import { WebCrawlerDialog } from "./web-crawler-dialog"

interface WebCrawlerTriggerProps {
  disabled?: boolean
  onStartCrawl?: () => void
}

export function WebCrawlerTrigger({
  disabled = false,
  onStartCrawl,
}: WebCrawlerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedUrlsCount = useWebCrawlerStore(
    (state) => state.selectedUrls.length
  )

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        disabled={disabled}
        className="inline-flex items-center gap-2"
      >
        <span className="icon-[fa7-solid--globe]" />
        <span>Rastreador Web</span>
        {selectedUrlsCount > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {selectedUrlsCount}
          </span>
        )}
      </Button>

      <WebCrawlerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
        onStartCrawl={onStartCrawl}
      />
    </>
  )
}
