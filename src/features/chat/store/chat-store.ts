import { generateId } from "ai"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  chatId?: string
  userTask: string
  contextualPrompt: string
  standalonePrompt: string
  includeReasoning: boolean
}

interface ChatActions {
  actions: {
    setChatId: (id: string) => void
    setUserTask: (query: string) => void
    setPrompts: (prompts: {
      contextualPrompt: string
      standalonePrompt: string
    }) => void
    setIncludeReasoning: (include: boolean) => void
    clearPrompts: () => void
    resetChat: () => void
    resetAll: () => void
  }
}

const createInitialState = () => ({
  chatId: generateId(),
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
        setChatId: (chatId) => set({ chatId }),
        setUserTask: (userTask) => set({ userTask }),
        setPrompts: ({ contextualPrompt, standalonePrompt }) =>
          set({ contextualPrompt, standalonePrompt }),
        setIncludeReasoning: (includeReasoning) => set({ includeReasoning }),
        clearPrompts: () =>
          set({
            contextualPrompt: "",
            standalonePrompt: "",
          }),
        resetChat: () => set({ chatId: generateId() }),
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
