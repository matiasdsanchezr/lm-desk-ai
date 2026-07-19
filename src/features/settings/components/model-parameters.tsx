"use client"

import { Slider } from "@/components/ui/slider"
import { useShallow } from "zustand/shallow"
import { useSettingsStore } from "../store/settings-store"

export const ModelParameters = () => {
  const { temperature, topP, setTemperature, setTopP } = useSettingsStore(
    useShallow((s) => ({
      temperature: s.temperature,
      topP: s.topP,
      setTemperature: s.setTemperature,
      setTopP: s.setTopP,
    }))
  )

  return (
    <div className="space-y-6 rounded-xl border border-border/40 bg-card/30 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="icon-[fa6-solid--temperature-half] h-3.5 w-3.5" />
            Temperatura
          </label>
          <span className="font-mono text-xs text-foreground tabular-nums">
            {temperature.toFixed(2)}
          </span>
        </div>
        <Slider
          value={temperature}
          onValueChange={(val) => setTemperature(val as number)}
          min={0}
          max={2}
          step={0.01}
          className="py-1"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          Controla la aleatoriedad. Valores bajos son más deterministas y
          precisos; valores altos son más creativos.
        </p>
      </div>

      <div className="h-px bg-border/40" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="icon-[fa6-solid--circle-half-stroke] h-3.5 w-3.5" />
            Top P (Nucleus)
          </label>
          <span className="font-mono text-xs text-foreground tabular-nums">
            {topP.toFixed(2)}
          </span>
        </div>
        <Slider
          value={topP}
          onValueChange={(val) => setTopP(val as number)}
          min={0}
          max={1}
          step={0.01}
          className="py-1"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          Limita el vocabulario del modelo a un porcentaje de probabilidad
          acumulada. Modifica la diversidad del texto.
        </p>
      </div>
    </div>
  )
}
