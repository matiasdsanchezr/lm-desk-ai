import { InferenceProvider } from "@/shared/services/inference-service/schemas/provider-schema"
import { InferenceModel } from "@/shared/services/inference-service/types/inference-model"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const DEFAULT_PROVIDER: InferenceProvider = "nvidiaNim"
const DEFAULT_MODEL = "z-ai/glm-5.2"
const DEFAULT_SYSTEM_PROMPT =
  "Eres un asistente experto en análisis de código fuente. Analiza el código proporcionado y responde de forma clara y concisa."
const DEFAULT_TEMPERATURE = 1
const DEFAULT_TOP_P = 0.9

interface SettingsState {
  modelConfig: InferenceModel
  systemPrompt: string
  temperature: number
  topP: number
}

interface SettingsActions {
  setModelConfig: (config: InferenceModel) => void
  setSystemPrompt: (prompt: string) => void
  setTemperature: (temp: number) => void
  setTopP: (topP: number) => void
  resetSystemPrompt: () => void
  resetAllSettings: () => void
}

const initialState: SettingsState = {
  modelConfig: { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL },
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: DEFAULT_TEMPERATURE,
  topP: DEFAULT_TOP_P,
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      modelConfig: { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL },
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      temperature: 1,
      topP: 0.9,
      setModelConfig: (modelConfig) => set({ modelConfig }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setTemperature: (temperature) => set({ temperature }),
      setTopP: (topP) => set({ topP }),
      resetSystemPrompt: () => set({ systemPrompt: DEFAULT_SYSTEM_PROMPT }),
      resetAllSettings: () => set(initialState),
    }),
    { name: "inference-settings" }
  )
)
