import { z } from "zod"
import {
  type InferenceProvider,
  InferenceProviderEnum,
} from "../schemas/provider-schema"

export const AntigravityModelEnum = z.enum([
  "gemini-3.1-flash-image",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash-high",
  "gemini-3-flash",
])
export type AntigravityModel = z.infer<typeof AntigravityModelEnum>

export const GeminiModelEnum = z.enum([
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-3-flash-lite-preview",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-flash-latest",
])
export type GeminiModel = z.infer<typeof GeminiModelEnum>

export const NvidiaNimModelEnum = z.enum([
  "nvidia/nemotron-3-ultra-550b-a55b",
  "deepseek-ai/deepseek-v4.1-flash",
  "z-ai/glm-5-3",
  "z-ai/glm-5-3-flash",
  "moonshotai/kimi-k3",
  "google/gemma-4-31b-it",
])
export type NvidiaNimModel = z.infer<typeof NvidiaNimModelEnum>

export const OpenAIModelEnum = z.enum([
  "gpt-5.6",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
])
export type OpenAIModel = z.infer<typeof OpenAIModelEnum>

export const OpenRouterModelEnum = z.enum([
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "z-ai/glm-5.2:free",
  "stealth/ox-alpha",
])
export type OpenRouterModel = z.infer<typeof OpenRouterModelEnum>

export const NvidiaNimModelSchema = z.object({
  provider: z.literal(InferenceProviderEnum.enum.nvidiaNim),
  model: NvidiaNimModelEnum,
})

export const OpenRouterModelSchema = z.object({
  provider: z.literal(InferenceProviderEnum.enum.openRouter),
  model: OpenRouterModelEnum,
})

export const GoogleModelSchema = z.object({
  provider: z.literal(InferenceProviderEnum.enum.google),
  model: GeminiModelEnum,
})

export const VertexModelSchema = z.object({
  provider: z.literal(InferenceProviderEnum.enum.vertex),
  model: GeminiModelEnum,
})

export const AgyCliModelSchema = z.object({
  provider: z.literal(InferenceProviderEnum.enum.antigravity),
  model: AntigravityModelEnum,
})

export const OpenAIModelSchema = z.object({
  provider: z.literal(InferenceProviderEnum.enum.openai),
  model: OpenAIModelEnum,
})

export const InferenceModelSchema = z.discriminatedUnion("provider", [
  NvidiaNimModelSchema,
  OpenRouterModelSchema,
  GoogleModelSchema,
  VertexModelSchema,
  AgyCliModelSchema,
  OpenAIModelSchema,
])

export type InferenceModel = z.infer<typeof InferenceModelSchema>

const PROVIDER_MODELS_MAP = {
  google: GeminiModelEnum,
  vertex: GeminiModelEnum,
  nvidiaNim: NvidiaNimModelEnum,
  openRouter: OpenRouterModelEnum,
  antigravity: AntigravityModelEnum,
  openai: OpenAIModelEnum,
} as const

export const getModelsForProvider = (provider: InferenceProvider): string[] => {
  const providerModels = PROVIDER_MODELS_MAP[provider]
  return providerModels?.options || []
}
