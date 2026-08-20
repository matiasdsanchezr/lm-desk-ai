import { generateId } from "ai"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  chatId?: string
  userTask: string
  contextualPrompt: string
  exportablePrompt: string
  includeContext: boolean
  includeReasoningHistory: boolean
}

interface ChatActions {
  actions: {
    setChatId: (id: string) => void
    setUserTask: (query: string) => void
    setIncludeContext: (include: boolean) => void
    setPrompts: (prompts: {
      contextualPrompt: string
      exportablePrompt: string
    }) => void
    setIncludeReasoningHistory: (include: boolean) => void
    resetGeneratedPrompts: () => void
    resetAll: () => void
  }
}

const createInitialState = () => ({
  chatId: generateId(),
  userTask: "",
  contextualPrompt: "",
  exportablePrompt: "",
  includeContext: true,
  includeReasoningHistory: true,
})

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...createInitialState(),
      actions: {
        setChatId: (chatId) => set({ chatId }),
        setUserTask: (userTask) => set({ userTask }),
        setIncludeContext: (includeContext) => set({ includeContext }),
        setPrompts: ({ contextualPrompt, exportablePrompt }) =>
          set({ contextualPrompt, exportablePrompt }),
        setIncludeReasoningHistory: (includeReasoningHistory) =>
          set({ includeReasoningHistory }),
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
        includeContext: state.includeContext,
        includeReasoningHistory: state.includeReasoningHistory,
      }),
    }
  )
)

export const useChatActions = () => useChatStore((state) => state.actions)
