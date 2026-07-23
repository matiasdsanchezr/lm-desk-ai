"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { memo, useCallback } from "react"
import type { FileTreeNode } from "../types/file-tree-node"
import type { NodeState } from "../types/node-state"

interface TreeNodeRowProps {
  node: FileTreeNode
  depth: number
  nodeState: NodeState
  onToggleSelection: (node: FileTreeNode) => void
  onToggleExpand: (nodeId: string) => void
  isExpanded: boolean
  disabled: boolean
  style: React.CSSProperties
  rowIndex: number
  totalVisibleNodes: number
}

export const TreeNodeRow = memo(function TreeNodeRow({
  node,
  depth,
  nodeState,
  onToggleSelection,
  onToggleExpand,
  isExpanded,
  disabled,
  style,
  rowIndex,
  totalVisibleNodes,
}: TreeNodeRowProps) {
  const { checked, indeterminate } = nodeState

  const handleRowClick = useCallback(() => {
    if (!node.isFile) {
      onToggleExpand(node.id)
    } else {
      onToggleSelection(node)
    }
  }, [node, onToggleExpand, onToggleSelection])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleRowClick()
      }
    },
    [handleRowClick]
  )

  const handleCheckboxChange = useCallback(() => {
    onToggleSelection(node)
  }, [node, onToggleSelection])

  return (
    <div
      style={style}
      className="w-full px-2"
      role="treeitem"
      aria-expanded={!node.isFile ? isExpanded : undefined}
      aria-selected={checked}
      aria-level={depth + 1}
      aria-posinset={rowIndex + 1}
      aria-setsize={totalVisibleNodes}
    >
      <div className="group relative">
        <div
          onClick={handleRowClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label={
            node.isFile
              ? `Seleccionar archivo ${node.name}`
              : `${isExpanded ? "Colapsar" : "Expandir"} carpeta ${node.name}`
          }
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            "pl-[calc(var(--depth)*12px+8px)]"
          )}
          style={{ "--depth": depth } as React.CSSProperties}
        >
          {/* Icono indicador expandir/colapsar */}
          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
            {!node.isFile && (
              <span
                className={cn(
                  "icon-[lucide--chevron-right] h-3 w-3 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            )}
          </div>

          {/* Icono del tipo de archivo/carpeta */}
          <span
            className={cn(
              "h-4 w-4 shrink-0",
              node.isFile
                ? "icon-[lucide--file-code-2] text-muted-foreground opacity-60"
                : isExpanded
                  ? "icon-[lucide--folder-open] text-amber-500"
                  : "icon-[lucide--folder] text-amber-600"
            )}
          />

          {/* Nombre */}
          <span
            className={cn(
              "flex-1 truncate",
              !node.isFile && "font-medium text-foreground"
            )}
          >
            {node.name}
          </span>
        </div>

        {/* Checkbox de selección */}
        <div
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/50 p-1 backdrop-blur-xs md:bg-transparent md:backdrop-blur-none"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled}
            className="h-5 w-5 shrink-0 md:h-4 md:w-4"
            aria-checked={indeterminate ? "mixed" : checked}
          />
        </div>
      </div>
    </div>
  )
})
