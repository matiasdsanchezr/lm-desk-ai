import { UIMessage } from "ai"

export interface Chat {
  id: string
  createdAt: string
  title: string
  selectedFiles: string[]
  messages?: UIMessage[]
}

export type ChatMeta = Pick<Chat, "id" | "title" | "createdAt">

export type CreateChatInput = {
  title?: string
  selectedFiles: string[]
  messages: UIMessage[]
}

export type UpdateChatInput = Partial<Omit<Chat, "id" | "createdAt">>

export interface ChatTurn {
  id: string
  userMessage?: UIMessage
  assistantMessage?: UIMessage
}
