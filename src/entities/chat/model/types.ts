import { UIMessage } from "ai"

export interface SavedChat {
  id: string
  createdAt: string
  title: string
  selectedFiles: string[]
  messages?: UIMessage[]
}

export type SavedChatMeta = Pick<SavedChat, "id" | "title" | "createdAt">

export interface SaveChatInput {
  id?: string
  title?: string
  selectedFiles: string[]
  messages: UIMessage[]
}

export type UpdateChatInput = Partial<Omit<SavedChat, "id" | "createdAt">>

export interface ChatTurn {
  id: string
  userMessage?: UIMessage
  assistantMessage?: UIMessage
}
