import z from "zod"

export const AntigravityModelEnum = z.enum([
  "gemini-3.1-pro-low",
  "gemini-pro-agent",
  "gemini-3-flash-agent",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-low",
  "gemini-3.5-flash-extra-low",
  "gemini-3-flash",
  "claude-opus-4-6-thinking",
  "claude-sonnet-4-6",
])
