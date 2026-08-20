import { ImageFile } from "@/shared/types/image-file"
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
  attachedImages: ImageFile[]
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
    setAttachedImages: (images: ImageFile[]) => void
    addAttachedImages: (newImages: ImageFile[]) => void
    removeAttachedImage: (index: number) => void
    clearAttachedImages: () => void
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
  attachedImages: [] as ImageFile[],
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
        setAttachedImages: (attachedImages) => set({ attachedImages }),
        addAttachedImages: (newImages) =>
          set((state) => {
            const existing = new Set(state.attachedImages.map((i) => i.base64))
            const filtered = newImages.filter(
              (img) => !existing.has(img.base64)
            )
            return { attachedImages: [...state.attachedImages, ...filtered] }
          }),
        removeAttachedImage: (indexToRemove) =>
          set((state) => ({
            attachedImages: state.attachedImages.filter(
              (_, i) => i !== indexToRemove
            ),
          })),
        clearAttachedImages: () => set({ attachedImages: [] }),
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
