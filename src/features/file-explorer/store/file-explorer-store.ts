import { FileContent } from "@/shared/services/file-service"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FileExplorerState {
  selectedFilePaths: string[]
  fileContents: FileContent[]
  includeDependencies: boolean
}

interface FileExplorerActions {
  setSelectedFilePaths: (files: string[]) => void
  setFileContents: (data: FileContent[]) => void
  setIncludeDependencies: (val: boolean) => void
  resetState: () => void
}

const initialState: FileExplorerState = {
  selectedFilePaths: [],
  fileContents: [],
  includeDependencies: true,
}

export const useFileExplorerStore = create<
  FileExplorerState & FileExplorerActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedFilePaths: (files) => set({ selectedFilePaths: files }),
      setFileContents: (data) => set({ fileContents: data }),
      setIncludeDependencies: (val) => set({ includeDependencies: val }),
      resetState: () => set(initialState),
    }),
    {
      name: "file-explorer-state",
      partialize: (state) => ({
        selectedFilePaths: state.selectedFilePaths,
        includeDependencies: state.includeDependencies,
      }),
    }
  )
)
