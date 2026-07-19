import z from "zod"

export const InferenceProviderEnum = z.enum([
  "genai",
  "vertex",
  "nvidiaNim",
  "openRouter",
  "antigravity",
  "openai"
])

export type InferenceProvider = z.infer<typeof InferenceProviderEnum>
