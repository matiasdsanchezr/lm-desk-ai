"use client"

import { useCallback, useState } from "react"

export function useTreeExpansion(initialExpanded?: Set<string>) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    initialExpanded ?? new Set()
  )

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const isExpanded = useCallback(
    (nodeId: string) => expandedNodes.has(nodeId),
    [expandedNodes]
  )

  return { toggleExpand, isExpanded, expandedNodes }
}
