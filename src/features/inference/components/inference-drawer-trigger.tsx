"use client"

import { Button } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import { useInferenceStore } from "../store/inference-store"

interface InferenceDrawerTriggerProps {
  className?: string
}

export function InferenceDrawerTrigger({
  className,
}: InferenceDrawerTriggerProps) {
  const toggleDrawer = useInferenceStore((s) => s.toggleDrawer)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
            className={cn(
              "size-8 rounded-lg text-muted-foreground transition-colors hover:text-foreground",
              className
            )}
            title="Configuración del modelo"
          >
            <span className="icon-[fa6-solid--sliders] size-3.5 shrink-0" />
            <span className="sr-only">Configuración del Modelo</span>
          </Button>
        }
      />
      <TooltipContent side="bottom">
        <p className="text-xs">Configuración del modelo</p>
      </TooltipContent>
    </Tooltip>
  )
}
