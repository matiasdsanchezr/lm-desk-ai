import { FileContent } from "@/shared/services/file-service"
import { ImageFile } from "@/shared/types/image-file"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FileExplorerState {
  selectedFilePaths: string[]
  fileContents: FileContent[]
  includeDependencies: boolean
  imageUrls: string
  imageFiles: ImageFile[]
}

interface FileExplorerActions {
  setSelectedFilePaths: (files: string[]) => void
  setFileContents: (data: FileContent[]) => void
  setImageUrls: (urls: string) => void
  setImageFiles: (imageFiles: ImageFile[]) => void
  setIncludeDependencies: (val: boolean) => void
  resetState: () => void
}

const initialState: FileExplorerState = {
  selectedFilePaths: [],
  fileContents: [],
  includeDependencies: true,
  imageUrls: "",
  imageFiles: [],
}

export const useFileExplorerStore = create<
  FileExplorerState & FileExplorerActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedFilePaths: (files) => set({ selectedFilePaths: files }),
      setFileContents: (data) => set({ fileContents: data }),
      setImageUrls: (urls) => set({ imageUrls: urls }),
      setImageFiles: (images) => set({ imageFiles: images }),
      setIncludeDependencies: (val) => set({ includeDependencies: val }),
      resetState: () => set(initialState),
    }),
    {
      name: "file-explorer-state",
      partialize: (state) => ({
        selectedFilePaths: state.selectedFilePaths,
        includeDependencies: state.includeDependencies,
        imageUrls: state.imageUrls,
      }),
    }
  )
)
