import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  userQuery: string
  userPrompt: string
  finalPrompt: string
  includeReasoning: boolean
}

interface ChatActions {
  actions: {
    setUserQuery: (query: string) => void
    setPrompts: (prompts: { userPrompt: string; finalPrompt: string }) => void
    setIncludeReasoning: (include: boolean) => void
    clearPrompts: () => void
    resetAll: () => void
  }
}

const initialState: ChatState = {
  userQuery: "",
  userPrompt: "",
  finalPrompt: "",
  includeReasoning: true,
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...initialState,
      actions: {
        setUserQuery: (userQuery) => set({ userQuery }),
        setPrompts: ({ userPrompt, finalPrompt }) =>
          set({ userPrompt, finalPrompt }),
        setIncludeReasoning: (includeReasoning) => set({ includeReasoning }),
        clearPrompts: () => set({ userPrompt: "", finalPrompt: "" }),
        resetAll: () => set(initialState),
      },
    }),
    {
      name: "chat-state",
      partialize: (state) => ({
        userQuery: state.userQuery,
        userPrompt: state.userPrompt,
        finalPrompt: state.finalPrompt,
        includeReasoning: state.includeReasoning,
      }),
    }
  )
)

export const useChatActions = () => useChatStore((state) => state.actions)
