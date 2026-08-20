"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseAutoScrollOptions {
  threshold?: number
  isStreaming?: boolean
  dependency?: unknown
}

export function useAutoScroll({
  threshold = 100,
  isStreaming = false,
  dependency,
}: UseAutoScrollOptions = {}) {
  const [isAtBottom, setIsAtBottom] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = false) => {
    endRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    })
  }, [])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    setIsAtBottom(distanceToBottom < threshold)
  }, [threshold])

  useEffect(() => {
    if (isStreaming && isAtBottom) {
      scrollToBottom(false)
    }
  }, [dependency, isStreaming, isAtBottom, scrollToBottom])

  return {
    containerRef,
    endRef,
    isAtBottom,
    setIsAtBottom,
    scrollToBottom,
    handleScroll,
  }
}
