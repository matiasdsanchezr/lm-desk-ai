import z from "zod"

export const OpenAIModelEnum = z.enum([
  "gpt-5.6",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
])
