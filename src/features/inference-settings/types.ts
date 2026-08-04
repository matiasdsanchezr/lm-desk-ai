export type Prompt = {
  id: string
  content: string
}

export type PromptMeta = Omit<Prompt, "content">

export type PromptList = {
  prompts: PromptMeta
}
