import type { AgentResponse as GeneratedContent } from "@/types/agent-response"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  userQuery: string
  generatedContent: GeneratedContent
}

interface ChatActions {
  setUserQuery: (query: string) => void
  setAgentResponse: (response: GeneratedContent) => void
  resetGeneratedContent: () => void
  resetAll: () => void
}

const initialState: ChatState = {
  userQuery: "",
  generatedContent: { response: "" },
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...initialState,
      setUserQuery: (query) => set({ userQuery: query }),
      setAgentResponse: (response) => set({ generatedContent: response }),
      resetGeneratedContent: () => set({ generatedContent: { response: "" } }),
      resetAll: () => set(initialState),
    }),
    {
      name: "chat-state",
      partialize: (state) => ({
        userQuery: state.userQuery,
        generatedContent: state.generatedContent,
      }),
    }
  )
)
