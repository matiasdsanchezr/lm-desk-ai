import { UIMessage } from "ai"

export interface Chat {
  id: string
  createdAt: string
  title: string
  selectedFilePaths: string[]
  messages: UIMessage[]
  activeStreamId?: string
}

export type ChatMeta = Pick<Chat, "id" | "title" | "createdAt">

export type CreateChatInput = {
  id?: string
  title?: string
  selectedFilePaths: string[]
  messages: UIMessage[]
  activeStreamId?: string
}

export type UpdateChatInput = Partial<Omit<Chat, "id" | "createdAt">>

export interface ChatTurn {
  id: string
  userMessage?: UIMessage
  assistantMessage?: UIMessage
}
