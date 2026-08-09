import { generateId } from "ai"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  chatId?: string
  userTask: string
  contextualPrompt: string
  exportablePrompt: string
  includeReasoning: boolean
}

interface ChatActions {
  actions: {
    setChatId: (id: string) => void
    setUserTask: (query: string) => void
    setPrompts: (prompts: {
      contextualPrompt: string
      exportablePrompt: string
    }) => void
    setIncludeReasoning: (include: boolean) => void
    resetGeneratedPrompts: () => void
    resetAll: () => void
  }
}

const createInitialState = () => ({
  chatId: generateId(),
  userTask: "",
  contextualPrompt: "",
  exportablePrompt: "",
  includeReasoning: true,
})

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...createInitialState(),
      actions: {
        setChatId: (chatId) => set({ chatId }),
        setUserTask: (userTask) => set({ userTask }),
        setPrompts: ({ contextualPrompt, exportablePrompt }) =>
          set({ contextualPrompt, exportablePrompt }),
        setIncludeReasoning: (includeReasoning) => set({ includeReasoning }),
        resetGeneratedPrompts: () =>
          set({
            contextualPrompt: "",
            exportablePrompt: "",
          }),
        resetAll: () => set(createInitialState()),
      },
    }),
    {
      name: "chat-state",
      partialize: (state) => ({
        userTask: state.userTask,
        includeReasoning: state.includeReasoning,
      }),
    }
  )
)

export const useChatActions = () => useChatStore((state) => state.actions)
