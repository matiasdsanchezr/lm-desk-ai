import { AgentResponse } from "@/types/agent-response"
import { FileContent } from "@/types/file-content"
import { ImageFile } from "@/types/image-file"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ChatState {
  selectedFiles: string[]
  userQuery: string
  fileContents: FileContent[]
  agentResponse: AgentResponse
  includeDependencies: boolean
  imageUrls: string
  images: ImageFile[]
}

interface ChatActions {
  setSelectedFiles: (files: string[]) => void
  setUserQuery: (query: string) => void
  setImageUrls: (urls: string) => void
  setFileContents: (data: FileContent[]) => void
  setAgentResponse: (response: AgentResponse) => void
  setImages: (images: ImageFile[]) => void
  setIncludeDependencies: (val: boolean) => void
  resetChatResult: () => void
  resetAll: () => void
}

const initialState: ChatState = {
  selectedFiles: [],
  userQuery: "",
  fileContents: [],
  agentResponse: { response: "" },
  includeDependencies: true,
  imageUrls: "",
  images: [],
}

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedFiles: (files) => set({ selectedFiles: files }),
      setUserQuery: (query) => set({ userQuery: query }),
      setImageUrls: (urls) => set({ imageUrls: urls }),
      setFileContents: (data) => set({ fileContents: data }),
      setAgentResponse: (response) => set({ agentResponse: response }),
      setIncludeDependencies: (val) => set({ includeDependencies: val }),
      setImages: (images) => set({ images }),
      resetChatResult: () =>
        set({
          fileContents: [],
          agentResponse: { response: "" },
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: "chat-state",
      partialize: (state) => ({
        selectedFiles: state.selectedFiles,
        userQuery: state.userQuery,
        agentResponse: state.agentResponse,
        includeDependencies: state.includeDependencies,
        images: state.images,
      }),
    }
  )
)
