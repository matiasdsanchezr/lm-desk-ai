"use client"

import { Button } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"
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
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              onClick={() => setIsOpen(true)}
              variant="ghost"
              disabled={disabled}
              className={cn(
                "h-7 rounded-lg text-xs transition-colors",
                selectedUrlsCount > 0
                  ? "gap-1.5 px-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                  : "size-7 p-0 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="icon-[lucide--globe] size-3.5 shrink-0" />
              {selectedUrlsCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-primary">
                  {selectedUrlsCount}
                </span>
              )}
            </Button>
          }
        />
        <TooltipContent side="top">
          <p className="text-xs">
            Rastreador Web
            {selectedUrlsCount > 0 && ` (${selectedUrlsCount} seleccionadas)`}
          </p>
        </TooltipContent>
      </Tooltip>

      <WebCrawlerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
        onStartCrawl={onStartCrawl}
      />
    </>
  )
}
