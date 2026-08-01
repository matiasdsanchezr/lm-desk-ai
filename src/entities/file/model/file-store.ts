import { FileContent } from "@/entities/file/model/types"
import { ImageFile } from "@/shared/types/image-file"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FileExplorerState {
  selectedFiles: string[]
  fileContents: FileContent[]
  includeDependencies: boolean
  imageUrls: string
  images: ImageFile[]
}

interface FileExplorerActions {
  setSelectedFiles: (files: string[]) => void
  setFileContents: (data: FileContent[]) => void
  setImageUrls: (urls: string) => void
  setImages: (images: ImageFile[]) => void
  setIncludeDependencies: (val: boolean) => void
  resetFiles: () => void
}

const initialState: FileExplorerState = {
  selectedFiles: [],
  fileContents: [],
  includeDependencies: false,
  imageUrls: "",
  images: [],
}

export const useFileExplorerStore = create<
  FileExplorerState & FileExplorerActions
>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedFiles: (files) => set({ selectedFiles: files }),
      setFileContents: (data) => set({ fileContents: data }),
      setImageUrls: (urls) => set({ imageUrls: urls }),
      setImages: (images) => set({ images }),
      setIncludeDependencies: (val) => set({ includeDependencies: val }),
      resetFiles: () => set(initialState),
    }),
    {
      name: "file-explorer-state",
      partialize: (state) => ({
        selectedFiles: state.selectedFiles,
        includeDependencies: state.includeDependencies,
        imageUrls: state.imageUrls,
      }),
    }
  )
)
