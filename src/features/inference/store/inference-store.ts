import { type InferenceModel } from "@/shared/services/inference-service/types/inference-model"
import { create } from "zustand"

const defaultProvider = "nvidiaNim"
const defaultModel = "z-ai/glm-5.2"

interface InferenceState {
  modelConfig: InferenceModel
  temperature: number
  topP: number
  systemPrompt: string
  isDrawerOpen: boolean
  setModelConfig: (config: InferenceModel) => void
  setTemperature: (temperature: number) => void
  setTopP: (topP: number) => void
  setSystemPrompt: (systemPrompt: string) => void
  resetSystemPrompt: () => void
  setIsDrawerOpen: (isOpen: boolean) => void
  toggleDrawer: () => void
}

export const useInferenceStore = create<InferenceState>((set) => ({
  modelConfig: {
    provider: defaultProvider,
    model: defaultModel,
  },
  temperature: 0.7,
  topP: 0.9,
  systemPrompt: "",
  isDrawerOpen: false,
  setModelConfig: (config) => set({ modelConfig: config }),
  setTemperature: (temperature) => set({ temperature }),
  setTopP: (topP) => set({ topP }),
  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  resetSystemPrompt: () => set({ systemPrompt: "" }),
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}))
