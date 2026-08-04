"use client"

import { Button } from "@/shared/components/ui/button"
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
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        disabled={disabled}
        className="inline-flex items-center gap-2"
      >
        <span className="icon-[fa7-solid--folder-open]" />
        <span>Explorador de archivos</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {selectedFilesCount}
        </span>
      </Button>

      <FileExplorerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        disabled={disabled}
      />
    </>
  )
}
