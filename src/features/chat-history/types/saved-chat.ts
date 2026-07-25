export interface SavedChat {
  id: string
  title: string
  createdAt: string
  selectedFiles: string[]
  userPrompt: string
  reasoning?: string
  response: string
}
