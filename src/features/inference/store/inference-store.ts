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

interface InferenceSettingsState {
  modelConfig: InferenceModel
  systemPrompt: string
  temperature: number
  topP: number
  isDrawerOpen: boolean
}

interface InferenceSettingsActions {
  setModelConfig: (config: InferenceModel) => void
  setSystemPrompt: (systemPrompt: string) => void
  setTemperature: (temp: number) => void
  setTopP: (topP: number) => void
  resetSystemPrompt: () => void
  resetAllSettings: () => void
  setIsDrawerOpen: (isDrawerOpen: boolean) => void
  toggleDrawer: () => void
}

const initialState: InferenceSettingsState = {
  modelConfig: { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL },
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: DEFAULT_TEMPERATURE,
  topP: DEFAULT_TOP_P,
  isDrawerOpen: false,
}

export const useInferenceStore = create<
  InferenceSettingsState & InferenceSettingsActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setModelConfig: (modelConfig) => set({ modelConfig }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setTemperature: (temperature) => set({ temperature }),
      setTopP: (topP) => set({ topP }),
      resetSystemPrompt: () => set({ systemPrompt: DEFAULT_SYSTEM_PROMPT }),
      resetAllSettings: () => set(initialState),
      setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
      toggleDrawer: () =>
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
    }),
    {
      name: "inference-settings",
      partialize: (state) => ({
        modelConfig: state.modelConfig,
        systemPrompt: state.systemPrompt,
        temperature: state.temperature,
        topP: state.topP,
      }),
    }
  )
)
