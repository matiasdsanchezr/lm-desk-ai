"use client"

import { useIsClient } from "@/shared/hooks/use-is-client"

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

  return isClient ? formatChatDate(dateValue) : null
}
