"use client"

import { useIsClient } from "@/shared/hooks/use-is-client"
import { useMemo } from "react"

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatChatDate(dateValue: Date | string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Fecha desconocida"
  return dateFormatter.format(date)
}

export function DateDisplay({ dateValue }: { dateValue: Date | string }) {
  const isClient = useIsClient()

  const validIsoDate = useMemo(() => {
    if (!dateValue) return null
    const parsedDate = new Date(dateValue)
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString()
  }, [dateValue])

  if (!validIsoDate) return ""

  return isClient ? formatChatDate(validIsoDate) : ""
}
