"use client"
import { Button } from "@/shared/components/ui/button"

export function SettingsDrawerSkeleton() {
  return (
    <Button
      variant="outline"
      size="icon"
      disabled
      className="fixed top-3 right-4 z-50 h-9 w-9 rounded-full border-border/40 bg-background/70 text-muted-foreground backdrop-blur-md transition-opacity opacity-70"
    >
      <span className="icon-[fa6-solid--sliders] h-4 w-4 animate-pulse" />
      <span className="sr-only">Cargando configuración...</span>
    </Button>
  )
}
