"use client"

import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import { useCallback, useState } from "react"

interface InlineMessageEditorProps {
  initialValue: string
  onSave: (newValue: string) => void
  onCancel: () => void
  className?: string
}

export function InlineMessageEditor({
  initialValue,
  onSave,
  onCancel,
  className = "min-h-24",
}: InlineMessageEditorProps) {
  const [value, setValue] = useState(initialValue)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onSave(value)
      }
      if (e.key === "Escape") {
        e.preventDefault()
        onCancel()
      }
    },
    [onSave, onCancel, value]
  )

  return (
    <div className="flex animate-in flex-col gap-2 fade-in zoom-in-95">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`resize-y bg-background font-mono text-xs md:text-sm ${className}`}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          <kbd className="rounded border bg-muted px-1 font-sans">Esc</kbd> para
          cancelar ·{" "}
          <kbd className="rounded border bg-muted px-1 font-sans">
            Ctrl+Enter
          </kbd>{" "}
          para guardar
        </span>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSave(value)}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
