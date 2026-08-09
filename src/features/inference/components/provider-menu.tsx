"use client"

import { InferenceProviderEnum } from "@/shared/services/inference-service/schemas/provider-schema"
import {
  getModelsForProvider,
  InferenceModelSchema,
  type InferenceModel,
} from "@/shared/services/inference-service/types/inference-model"
import { formatProviderName } from "@/shared/services/inference-service/utils/model-formatter"
import { useShallow } from "zustand/shallow"
import { NavSelector } from "../../../shared/components/nav-selector"
import { useInferenceStore } from "../store/inference-store"

export const ProviderMenu = () => {
  const { config, setConfig } = useInferenceStore(
    useShallow((s) => ({
      config: s.modelConfig,
      setConfig: s.setModelConfig,
    }))
  )

  const availableModels = getModelsForProvider(config.provider)
  const modelOptions = availableModels.map((m) => ({ label: m, value: m }))
  const providerOptions = InferenceProviderEnum.options.map((p) => ({
    label: formatProviderName(p),
    value: p,
  }))

  const handleProviderChange = (newProvider: string) => {
    const provider = InferenceProviderEnum.safeParse(newProvider)
    if (provider.error) {
      console.error("Proveedor inválido")
      return
    }
    const model = getModelsForProvider(provider.data)[0]
    const parsed = InferenceModelSchema.safeParse({
      provider: provider.data,
      model,
    })

    if (parsed.error) {
      console.error("Combinación de Proveedor y Modelo inválida")
      return
    }
    setConfig(parsed.data)
  }

  return (
    <div className="space-y-5 rounded-xl border border-border/40 bg-card/30 p-4">
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="icon-[fa6-solid--server] h-3.5 w-3.5" />
          Proveedor de IA
        </label>
        <NavSelector
          label="Proveedor"
          value={config.provider}
          options={providerOptions}
          onChange={handleProviderChange}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="icon-[fa6-solid--microchip] h-3.5 w-3.5" />
          Modelo de Lenguaje
        </label>
        <NavSelector
          label="Modelo"
          value={config.model}
          options={modelOptions}
          onChange={(val) =>
            setConfig({ ...config, model: val } as InferenceModel)
          }
        />
      </div>
    </div>
  )
}
