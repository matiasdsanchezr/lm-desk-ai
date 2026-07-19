import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { memo, useCallback, useMemo } from "react"
import { FileTreeNode } from "../actions/get-file-tree"
import { type NodeState } from "../types/node-state"

interface TreeNodeRowProps {
  node: FileTreeNode
  depth: number
  selectedSet: Set<string>
  folderToFiles: Map<string, string[]>
  onToggleSelection: (node: FileTreeNode) => void
  onToggleExpand: (nodeId: string) => void
  isExpanded: (nodeId: string) => boolean
  disabled: boolean
  style: React.CSSProperties
  rowIndex: number
  totalVisibleNodes: number
}

const IndeterminateCheckbox = memo(function IndeterminateCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  className,
  disabled,
}: {
  checked: boolean
  indeterminate: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(val) => onCheckedChange(!!val)}
      className={cn("h-5 w-5 shrink-0 md:h-4 md:w-4", className)}
      onClick={(e) => e.stopPropagation()}
      disabled={disabled}
      aria-checked={indeterminate ? "mixed" : checked}
    />
  )
})

export const TreeNodeRow = memo(function TreeNodeRow({
  node,
  depth,
  selectedSet,
  folderToFiles,
  onToggleSelection,
  onToggleExpand,
  isExpanded,
  disabled,
  style,
  rowIndex,
  totalVisibleNodes,
}: TreeNodeRowProps) {
  const expanded = isExpanded(node.id)

  const { checked, indeterminate } = useMemo<NodeState>(() => {
    if (node.isFile) {
      return {
        checked: selectedSet.has(node.filePath ?? ""),
        indeterminate: false,
      }
    }
    const files = folderToFiles.get(node.id) ?? []
    if (files.length === 0) return { checked: false, indeterminate: false }
    const selectedCount = files.filter((f) => selectedSet.has(f)).length
    return {
      checked: selectedCount === files.length,
      indeterminate: selectedCount > 0 && selectedCount < files.length,
    }
  }, [node, selectedSet, folderToFiles])

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
      aria-expanded={!node.isFile ? expanded : undefined}
      aria-rowindex={rowIndex + 1}
      aria-selected={checked}
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
              : `${expanded ? "Colapsar" : "Expandir"} carpeta ${node.name}`
          }
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            "pl-[calc(var(--depth)*12px+8px)]"
          )}
          style={{ "--depth": depth } as React.CSSProperties}
        >
          {/* Chevron para carpetas */}
          <div className="flex h-4 w-4 shrink-0 items-center justify-center">
            {!node.isFile && (
              <span
                className={cn(
                  "icon-[fa7-solid--chevron-right] h-3 w-3 transition-transform duration-200",
                  expanded && "rotate-90"
                )}
              />
            )}
          </div>

          {/* Icono de tipo */}
          <span
            className={cn(
              "h-4 w-4 shrink-0",
              node.isFile
                ? "icon-[fa7-solid--file-code] opacity-50"
                : expanded
                  ? "icon-[fa7-solid--folder-open] text-yellow-500"
                  : "icon-[fa7-solid--folder] text-yellow-600"
            )}
          />

          {/* Nombre del nodo */}
          <span
            className={cn(
              "flex-1 truncate",
              !node.isFile && "font-medium text-foreground"
            )}
          >
            {node.name}
          </span>
        </div>

        {/* Checkbox */}
        <div
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/50 p-1 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
          onClick={(e) => e.stopPropagation()}
        >
          <IndeterminateCheckbox
            checked={checked}
            indeterminate={indeterminate}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
})
