import { type GoogleLanguageModelOptions } from "@ai-sdk/google"
import { type GenerateTextOptions } from "../types/inference-request-options"

type Reasoning = GenerateTextOptions["reasoning"]

export const toThinkingLevel = (reasoning?: Reasoning) => {
  switch (reasoning) {
    case "provider-default":
      return undefined
    case "none":
      return "minimal"
    case "xhigh":
      return "high"
    default:
      return reasoning
  }
}

export const googleDefaultSafety: GoogleLanguageModelOptions = {
  safetySettings: [
    { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_UNSPECIFIED", threshold: "BLOCK_NONE" },
  ],
}
