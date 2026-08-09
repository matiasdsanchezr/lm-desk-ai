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

  const sortedSelectedFilePaths = useMemo(() => {
    return [...selectedFilePaths].sort()
  }, [selectedFilePaths])

  const flattenTree = useCallback(
    (nodes: FileTreeNode[], currentDepth = 0): FlattenedNode[] => {
      let result: FlattenedNode[] = []
      for (const node of nodes) {
        result.push({ node, depth: currentDepth })
        if (
          !node.isFile &&
          expandedNodes.has(node.id) &&
          node.children.length > 0
        ) {
          result = result.concat(flattenTree(node.children, currentDepth + 1))
        }
      }
      return result
    },
    [expandedNodes]
  )

  const flattenedTreeNodes = useMemo(
    () => flattenTree(treeNodes),
    [treeNodes, flattenTree]
  )

  const treeScrollRef = useRef<HTMLDivElement>(null)
  const selectedScrollRef = useRef<HTMLDivElement>(null)

  const getTreeScrollElement = useCallback(() => treeScrollRef.current, [])
  const getSelectedScrollElement = useCallback(
    () => selectedScrollRef.current,
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const treeVirtualizer = useVirtualizer({
    count: flattenedTreeNodes.length,
    getScrollElement: getTreeScrollElement,
    estimateSize: () => 32,
    overscan: 10,
  })

  const selectedVirtualizer = useVirtualizer({
    count: sortedSelectedFilePaths.length,
    getScrollElement: getSelectedScrollElement,
    estimateSize: () => 64,
    overscan: 5,
    measureElement:
      typeof window !== "undefined"
        ? (el: Element) => el.getBoundingClientRect().height
        : undefined,
  })

  const measureSelectedElement = useCallback(
    (el: HTMLDivElement | null) => {
      selectedVirtualizer.measureElement(el)
    },
    [selectedVirtualizer]
  )

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
          <span className="mr-1.5 icon-[fa7-solid--sitemap] h-3.5 w-3.5" />
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
          <span className="mr-1.5 icon-[fa7-solid--square-check] h-3.5 w-3.5" />
          Seleccionados
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {selectedFilesCount}
          </Badge>
        </Button>
      </div>

      <div className="flex min-h-75 flex-col overflow-hidden rounded-xl border bg-card md:h-125 md:flex-row">
        {/* PANEL IZQUIERDO: ÁRBOL */}
        <div
          className={cn(
            "flex flex-1 flex-col border-b md:w-1/2 md:border-r md:border-b-0 lg:w-2/5",
            activeTab === "tree" ? "flex" : "hidden md:flex"
          )}
        >
          <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="icon-[fa7-solid--sitemap] h-4 w-4" />
              Estructura de archivos
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleRefresh}
                disabled={disabled || isPending}
                title="Recargar archivos del servidor"
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5",
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
                const { node, depth } = flattenedTreeNodes[virtualRow.index]!
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

        {/* PANEL DERECHO: SELECCIONADOS */}
        <div
          className={cn(
            "flex flex-1 flex-col md:w-1/2 lg:w-3/5",
            activeTab === "selected" ? "flex" : "hidden md:flex"
          )}
        >
          <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="icon-[fa7-solid--square-check] h-4 w-4" />
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
                        className="h-8 w-8 p-0 hover:text-destructive md:h-auto md:w-auto md:px-2"
                        disabled={disabled}
                      >
                        <span className="icon-[fa7-solid--trash] h-4 w-4 md:mr-1.5" />
                        <span className="hidden text-xs md:inline">
                          Limpiar
                        </span>
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Limpiar selección?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se de-seleccionarán {selectedFilePaths.length} archivos.
                        Esta acción no se puede deshacer.
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

          <div ref={selectedScrollRef} className="flex-1 overflow-y-auto px-3">
            {sortedSelectedFilePaths.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
                <span className="icon-[fa7-solid--arrow-pointer] h-8 w-8 opacity-50" />
                <p className="px-4 text-center text-sm">
                  Selecciona archivos o carpetas del explorador para comenzar
                </p>
              </div>
            ) : (
              <div
                style={{
                  height: `${selectedVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                  marginTop: "12px",
                }}
              >
                {selectedVirtualizer.getVirtualItems().map((virtualRow) => {
                  const file = sortedSelectedFilePaths[virtualRow.index]!
                  const parts = file.split("/")
                  const fileName = parts.pop() ?? file
                  const folderPath = parts.join("/")

                  return (
                    <div
                      key={file}
                      ref={measureSelectedElement}
                      data-index={virtualRow.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                        paddingBottom: "6px",
                      }}
                    >
                      <div className="group relative flex flex-col justify-center gap-0.5 overflow-hidden rounded-md border bg-card p-2.5 transition-all hover:border-primary/20 hover:shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="icon-[fa7-solid--file-code] h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="flex-1 truncate text-[13px] font-medium">
                            {fileName}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
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
                            <span className="icon-[fa7-solid--xmark] h-3.5 w-3.5" />
                          </Button>
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
