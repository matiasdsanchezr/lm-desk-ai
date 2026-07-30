import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  sessionId: string
  userTask: string
  contextualPrompt: string
  standalonePrompt: string
  includeReasoning: boolean
}

interface ChatActions {
  actions: {
    setUserTask: (query: string) => void
    setPrompts: (prompts: {
      contextualPrompt: string
      standalonePrompt: string
    }) => void
    setIncludeReasoning: (include: boolean) => void
    clearPrompts: () => void
    resetAll: () => void
  }
}

const createInitialState = () => ({
  sessionId: crypto.randomUUID(),
  userTask: "",
  contextualPrompt: "",
  standalonePrompt: "",
  includeReasoning: true,
})

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...createInitialState(),
      actions: {
        setUserTask: (userTask) => set({ userTask }),
        setPrompts: ({ contextualPrompt, standalonePrompt }) =>
          set({ contextualPrompt, standalonePrompt }),
        setIncludeReasoning: (includeReasoning) => set({ includeReasoning }),
        clearPrompts: () =>
          set({
            sessionId: crypto.randomUUID(),
            contextualPrompt: "",
            standalonePrompt: "",
          }),
        resetAll: () => set(createInitialState()),
      },
    }),
    {
      name: "chat-state",
      partialize: (state) => ({
        sessionId: state.sessionId,
        userTask: state.userTask,
        contextualPrompt: state.contextualPrompt,
        standalonePrompt: state.standalonePrompt,
        includeReasoning: state.includeReasoning,
      }),
    }
  )
)

export const useChatActions = () => useChatStore((state) => state.actions)
