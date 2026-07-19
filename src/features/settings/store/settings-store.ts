import { InferenceProvider } from "@/services/inference/schemas/provider-schema"
import { InferenceModel } from "@/services/inference/types/inference-model"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const DEFAULT_PROVIDER: InferenceProvider = "nvidiaNim"
const DEFAULT_MODEL = "z-ai/glm-5.2"
const DEFAULT_SYSTEM_PROMPT =
  "Eres un asistente experto en análisis de código fuente. Analiza el código proporcionado y responde de forma clara y concisa."

interface SettingsState {
  config: InferenceModel
  systemPrompt: string
  temperature: number
  topP: number
}

interface SettingsActions {
  setConfig: (config: InferenceModel) => void
  setSystemPrompt: (prompt: string) => void
  setTemperature: (temp: number) => void
  setTopP: (topP: number) => void
  resetSystemPrompt: () => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      config: { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL },
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      temperature: 1,
      topP: 0.9,
      setConfig: (config) => set({ config }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setTemperature: (temperature) => set({ temperature }),
      setTopP: (topP) => set({ topP }),
      resetSystemPrompt: () => set({ systemPrompt: DEFAULT_SYSTEM_PROMPT }),
    }),
    { name: "llm-settings-state" }
  )
)
