import { InferUITools, ToolSet, UIMessage } from "ai"
import z from "zod"

export const metadataSchema = z.object({})

export type Metadata = z.infer<typeof metadataSchema>

export const fileContentSchema = z.object({
  path: z.string(),
  content: z.string().optional(),
  error: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  language: z.string().optional(),
})

export const webSourceSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  content: z.string(),
})

export type WebSourceItem = z.infer<typeof webSourceSchema>

export const dataPartSchema = z.object({
  contextFiles: z.array(fileContentSchema).optional(),
  webSources: z.array(webSourceSchema).optional(),
})

export const dataSchemas = {
  contextFiles: z.array(fileContentSchema),
  webSources: z.array(webSourceSchema),
}

export type DataPart = z.infer<typeof dataPartSchema>

export const tools = {} satisfies ToolSet

export type Tools = InferUITools<typeof tools>

export type MyUIMessage = UIMessage<Metadata, DataPart, Tools>

export interface Chat {
  id: string
  createdAt: string
  title: string
  selectedFilePaths?: string[]
  messages: MyUIMessage[]
  activeStreamId?: string
}

export type ChatMeta = Pick<Chat, "id" | "title" | "createdAt">

export type CreateChatInput = {
  id?: string
  title?: string
  selectedFilePaths?: string[]
  messages: MyUIMessage[]
  activeStreamId?: string
}

export type UpdateChatInput = Partial<Omit<Chat, "id" | "createdAt">>

export interface ChatTurn {
  id: string
  userMessage?: MyUIMessage
  assistantMessage?: MyUIMessage
}

export type MessageRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt?: string | Date
}

export interface FormatOptions {
  includeTimestamps?: boolean
  userLabel?: string
  assistantLabel?: string
  systemLabel?: string
}
