export type SystemPromptTemplate = {
  id: string
  content: string
}

export type SystemPromptMeta = Omit<SystemPromptTemplate, "content">
