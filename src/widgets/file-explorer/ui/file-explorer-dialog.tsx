"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useShallow } from "zustand/shallow"
import { FileTreeNode } from "../model/file-explorer-get-tree-types"
import { useFileExplorerStore } from "../model/file-explorer-store"
import { FileExplorerView } from "./file-explorer-view"

interface FileExplorerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  treeNodes: FileTreeNode[]
  totalFiles: number
  disabled?: boolean
}

export function FileExplorerDialog({
  open,
  onOpenChange,
  treeNodes,
  totalFiles,
  disabled,
}: FileExplorerDialogProps) {
  const {
    selectedFiles,
    includeDependencies,
    setSelectedFiles,
    setIncludeDependencies,
  } = useFileExplorerStore(
    useShallow((s) => ({
      selectedFiles: s.selectedFiles,
      includeDependencies: s.includeDependencies,
      setSelectedFiles: s.setSelectedFiles,
      setIncludeDependencies: s.setIncludeDependencies,
    }))
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-6xl">
        <DialogHeader className="border-b border-border/40 px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
            <span className="icon-[fa7-solid--folder-open] text-primary" />
            Explorador del Proyecto
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Selecciona los archivos del proyecto que se incluirán como contexto
            en la consulta.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-6">
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border/40 p-1">
            <FileExplorerView
              treeNodes={treeNodes}
              totalFiles={totalFiles}
              disabled={disabled}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
            />
          </div>

          <div className="flex shrink-0 items-start gap-2.5 pt-2 sm:items-center">
            <Checkbox
              id="include-deps"
              checked={includeDependencies}
              onCheckedChange={(val) => setIncludeDependencies(!!val)}
              disabled={disabled}
              className="mt-0.5 shrink-0 sm:mt-0"
            />
            <Label
              htmlFor="include-deps"
              className="cursor-pointer text-xs leading-tight text-foreground sm:text-sm"
            >
              Incluir dependencias de los archivos seleccionados
            </Label>
          </div>
        </div>

        <DialogFooter className="border-t border-border/40 bg-muted/20 px-4 py-3 sm:px-6">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </span>
            <Button onClick={() => onOpenChange(false)} size="sm">
              Confirmar selección
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
