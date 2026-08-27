"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useRef, useState, useTransition } from "react"
import { refreshFileTreeAction } from "../actions"
import { useFileExplorerContext } from "../context/file-explorer-context"
import { useFileSelection } from "../hooks/use-file-selection"
import { useTreeExpansion } from "../hooks/use-tree-expansion"
import type { FileTreeNode } from "../types"
import { TreeNodeRow } from "./tree-node-row"

interface FileExplorerPanelProps {
  disabled?: boolean
  selectedFilePaths: string[]
  onSelectionChange: (files: string[]) => void
}

interface FlattenedNode {
  node: FileTreeNode
  depth: number
}

export function FileExplorerPanel({
  disabled = false,
  selectedFilePaths,
  onSelectionChange,
}: FileExplorerPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { treeNodes, totalFiles } = useFileExplorerContext()

  const {
    getNodeSelectionState,
    toggleNodeSelection,
    clearSelectedFilePaths,
    selectedFilesCount,
  } = useFileSelection({
    selectedFilePaths,
    onSelectionChange,
  })

  const { isExpanded, toggleExpand, expandedNodes } = useTreeExpansion()
  const [activeTab, setActiveTab] = useState<"tree" | "selected">("tree")

  const sortedSelectedFilePaths = useMemo(
    () => [...selectedFilePaths].sort(),
    [selectedFilePaths]
  )

  // Aplanamiento del árbol optimizado sin re-crear recursión innecesaria
  const flattenedTreeNodes = useMemo(() => {
    const result: FlattenedNode[] = []
    const flatten = (nodes: FileTreeNode[], depth: number) => {
      for (const node of nodes) {
        result.push({ node, depth })
        if (
          !node.isFile &&
          expandedNodes.has(node.id) &&
          node.children?.length
        ) {
          flatten(node.children, depth + 1)
        }
      }
    }
    flatten(treeNodes, 0)
    return result
  }, [treeNodes, expandedNodes])

  const treeScrollRef = useRef<HTMLDivElement>(null)

  // Virtualizador SOLO para el árbol (donde realmente hay miles de archivos)
  // eslint-disable-next-line react-hooks/incompatible-library
  const treeVirtualizer = useVirtualizer({
    count: flattenedTreeNodes.length,
    getScrollElement: () => treeScrollRef.current,
    estimateSize: () => 32,
    overscan: 10,
  })

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      await refreshFileTreeAction()
      router.refresh()
    })
  }, [router])

  return (
    <div className="flex flex-col gap-3">
      {/* Selector móvil */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 md:hidden">
        <Button
          onClick={() => setActiveTab("tree")}
          variant={activeTab === "tree" ? "default" : "ghost"}
          className="flex-1 text-xs"
          size="sm"
        >
          <span className="mr-1.5 icon-[fa7-solid--sitemap] size-3.5" />
          Estructura
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {totalFiles}
          </Badge>
        </Button>
        <Button
          onClick={() => setActiveTab("selected")}
          variant={activeTab === "selected" ? "default" : "ghost"}
          className="flex-1 text-xs"
          size="sm"
        >
          <span className="mr-1.5 icon-[fa7-solid--square-check] size-3.5" />
          Seleccionados
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {selectedFilesCount}
          </Badge>
        </Button>
      </div>

      <div className="flex min-h-75 flex-col overflow-hidden rounded-xl border border-border/60 bg-card md:h-125 md:flex-row">
        {/* PANEL IZQUIERDO: ÁRBOL (VIRTUALIZADO) */}
        <div
          className={cn(
            "flex flex-1 flex-col border-b border-border/40 md:w-1/2 md:border-r md:border-b-0 lg:w-2/5",
            activeTab === "tree" ? "flex" : "hidden md:flex"
          )}
        >
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <span className="icon-[fa7-solid--sitemap] size-3.5 text-primary" />
              Estructura de archivos
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={handleRefresh}
                disabled={disabled || isPending}
                title="Recargar archivos del servidor"
              >
                <span
                  className={cn(
                    "size-3.5",
                    isPending
                      ? "icon-[fa7-solid--spinner] animate-spin"
                      : "icon-[fa7-solid--arrows-rotate]"
                  )}
                />
              </Button>
              <Badge
                variant="secondary"
                className="hidden text-xs sm:inline-flex"
              >
                {totalFiles} archivos
              </Badge>
            </div>
          </div>

          <div
            ref={treeScrollRef}
            className="flex-1 overflow-y-auto"
            style={{ contain: "content" }}
          >
            <div
              role="tree"
              aria-label="Explorador de archivos"
              style={{
                height: `${treeVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {treeVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = flattenedTreeNodes[virtualRow.index]
                if (!item) return null
                const { node, depth } = item
                return (
                  <TreeNodeRow
                    key={node.id}
                    node={node}
                    depth={depth}
                    selectionState={getNodeSelectionState(node)}
                    onToggleNodeSelection={toggleNodeSelection}
                    onToggleExpand={toggleExpand}
                    isExpanded={isExpanded(node.id)}
                    disabled={disabled || isPending}
                    rowIndex={virtualRow.index}
                    totalVisibleNodes={flattenedTreeNodes.length}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: SELECCIONADOS (LISTA NATIVA DIRECTA, SIN OVERHEAD) */}
        <div
          className={cn(
            "flex flex-1 flex-col md:w-1/2 lg:w-3/5",
            activeTab === "selected" ? "flex" : "hidden md:flex"
          )}
        >
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <span className="icon-[fa7-solid--square-check] size-3.5 text-primary" />
              Archivos seleccionados
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedFilesCount}</Badge>

              {selectedFilePaths.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        disabled={disabled}
                      >
                        <span className="icon-[fa7-solid--trash] mr-1 size-3" />
                        <span>Limpiar</span>
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Limpiar selección?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se deseleccionarán {selectedFilePaths.length} archivos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearSelectedFilePaths}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {sortedSelectedFilePaths.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <span className="icon-[fa7-solid--arrow-pointer] size-6 opacity-40" />
                <p className="text-center text-xs">
                  Selecciona archivos o carpetas del explorador para comenzar
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {sortedSelectedFilePaths.map((file) => {
                  const parts = file.split("/")
                  const fileName = parts.pop() ?? file
                  const folderPath = parts.join("/")

                  return (
                    <div
                      key={file}
                      className="group flex items-center justify-between rounded-lg border border-border/40 bg-card/60 px-2.5 py-1.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
                    >
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="icon-[fa7-solid--file-code] size-3.5 shrink-0 text-primary" />
                          <span className="truncate text-xs font-medium text-foreground">
                            {fileName}
                          </span>
                        </div>
                        {folderPath && (
                          <span
                            title={file}
                            className="truncate pl-5 font-mono text-[10px] text-muted-foreground"
                          >
                            {folderPath}/
                          </span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        onClick={() =>
                          toggleNodeSelection({
                            id: file,
                            name: fileName,
                            isFile: true,
                            filePath: file,
                            children: [],
                          })
                        }
                        disabled={disabled}
                        aria-label={`Eliminar ${fileName} de la selección`}
                      >
                        <span className="icon-[fa7-solid--xmark] size-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
