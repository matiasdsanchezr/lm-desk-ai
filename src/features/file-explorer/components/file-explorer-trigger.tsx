"use client"

import { Button } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import { useState } from "react"
import { useFileExplorerStore } from "../store/file-explorer-store"
import { FileExplorerDialog } from "./file-explorer-dialog"

interface FileExplorerTriggerProps {
  disabled?: boolean
}

export function FileExplorerTrigger({
  disabled = false,
}: FileExplorerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedFilesCount = useFileExplorerStore(
    (state) => state.selectedFilePaths.length
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
                selectedFilesCount > 0
                  ? "gap-1.5 px-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                  : "size-7 p-0 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="icon-[lucide--folder-open] size-3.5 shrink-0" />
              {selectedFilesCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-primary">
                  {selectedFilesCount}
                </span>
              )}
            </Button>
          }
        />
        <TooltipContent side="top">
          <p className="text-xs">
            Explorador de archivos
            {selectedFilesCount > 0 && ` (${selectedFilesCount} seleccionados)`}
          </p>
        </TooltipContent>
      </Tooltip>

      <FileExplorerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
      />
    </>
  )
}
