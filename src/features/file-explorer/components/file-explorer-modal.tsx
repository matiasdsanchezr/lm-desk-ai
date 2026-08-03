"use client"

import { Button } from "@/shared/components/ui/button"
import { useState } from "react"
import { useFileExplorerStore } from "../store/file-explorer-store"
import { FileExplorerDialog } from "./file-explorer-dialog"

interface FileExplorerModalProps {
  disabled?: boolean
}

export function FileExplorerModal({
  disabled = false,
}: FileExplorerModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedCount = useFileExplorerStore(
    (state) => state.selectedFiles.length
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
          {selectedCount}
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
