import { UIMessage } from "ai"
import z from "zod"

export const fileSourceSchema = z.object({
  type: z.literal("file"),
  path: z.string(),
  content: z.string().optional(),
  error: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  language: z.string().optional(),
})
export type FileSource = z.infer<typeof fileSourceSchema>

export const webSourceSchema = z.object({
  type: z.literal("web"),
  url: z.url(),
  title: z.string().optional(),
  content: z.string(),
  error: z.string().optional(),
})
export type WebSource = z.infer<typeof webSourceSchema>

export const contextSourceSchema = z.discriminatedUnion("type", [
  fileSourceSchema,
  webSourceSchema,
])
export type ContextSource = z.infer<typeof contextSourceSchema>

export const dataSchemas = {
  contextSources: z.array(contextSourceSchema),
}

export type ChatDataTypes = {
  contextSources: ContextSource[]
}

export type MyUIMessage = UIMessage<never, ChatDataTypes>

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

export interface FormatOptions {
  includeTimestamps?: boolean
  userLabel?: string
  assistantLabel?: string
  systemLabel?: string
}
