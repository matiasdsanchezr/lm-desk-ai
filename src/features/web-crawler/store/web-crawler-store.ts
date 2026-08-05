import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WebCrawlerStoreState } from "../types"

export const useWebCrawlerStore = create<WebCrawlerStoreState>()(
  persist(
    (set, get) => ({
      inputUrls: "",
      maxDepth: 1,
      maxPages: 10,
      crawledPages: [],
      selectedUrls: [],
      isCrawling: false,

      setInputUrls: (inputUrls) => set({ inputUrls }),
      setMaxDepth: (maxDepth) => set({ maxDepth }),
      setMaxPages: (maxPages) => set({ maxPages }),
      setCrawledPages: (crawledPages) => set({ crawledPages }),
      setSelectedUrls: (selectedUrls) => set({ selectedUrls }),

      toggleUrlSelection: (url) => {
        const { selectedUrls } = get()
        const exists = selectedUrls.includes(url)
        if (exists) {
          set({ selectedUrls: selectedUrls.filter((u) => u !== url) })
        } else {
          set({ selectedUrls: [...selectedUrls, url] })
        }
      },

      selectAllPages: () => {
        const { crawledPages } = get()
        const successfulUrls = crawledPages
          .filter((p) => p.status === "success")
          .map((p) => p.url)
        set({ selectedUrls: successfulUrls })
      },

      clearSelectedUrls: () => set({ selectedUrls: [] }),
      setIsCrawling: (isCrawling) => set({ isCrawling }),

      resetState: () =>
        set({
          inputUrls: "",
          maxDepth: 1,
          maxPages: 10,
          crawledPages: [],
          selectedUrls: [],
          isCrawling: false,
        }),
    }),
    {
      name: "web-crawler-storage",
      partialize: (state) => ({
        inputUrls: state.inputUrls,
        maxDepth: state.maxDepth,
        maxPages: state.maxPages,
        selectedUrls: state.selectedUrls,
      }),
    }
  )
)
