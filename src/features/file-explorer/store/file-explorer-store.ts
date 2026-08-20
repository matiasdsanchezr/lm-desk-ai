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
  addImageFiles: (newImages: ImageFile[]) => void
  removeImageFile: (index: number) => void
  clearImageFiles: () => void
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
      addImageFiles: (newImages) =>
        set((state) => {
          const existing = new Set(state.imageFiles.map((i) => i.base64))
          const filtered = newImages.filter((img) => !existing.has(img.base64))
          return { imageFiles: [...state.imageFiles, ...filtered] }
        }),
      removeImageFile: (indexToRemove) =>
        set((state) => ({
          imageFiles: state.imageFiles.filter((_, i) => i !== indexToRemove),
        })),
      clearImageFiles: () => set({ imageFiles: [], imageUrls: "" }),
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
