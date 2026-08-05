import z from "zod"

export const InferenceProviderEnum = z.enum([
  "google",
  "vertex",
  "nvidiaNim",
  "openRouter",
  "antigravity",
  "openai",
])

export type InferenceProvider = z.infer<typeof InferenceProviderEnum>
