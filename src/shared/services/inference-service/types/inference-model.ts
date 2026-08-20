import { z } from "zod"
import {
  type InferenceProvider,
  InferenceProviderEnum,
} from "../schemas/provider-schema"

export const AntigravityModelEnum = z.enum([
  "gemini-3.1-pro-low",
  "gemini-pro-agent",
  "gemini-3-flash-agent",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-low",
  "gemini-3.5-flash-extra-low",
  "gemini-3-flash",
  "gemini-3.6-flash-high(high)",
  "gemini-3.7-flash-high",
  "claude-opus-4-6-thinking",
  "claude-sonnet-4-6",
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
  "z-ai/glm-5.2",
  "minimaxai/minimax-m2.7",
  "minimaxai/minimax-m3",
  "deepseek-ai/deepseek-v4-flash",
  "deepseek-ai/deepseek-v4-pro",
  "nvidia/nemotron-3-ultra-550b-a55b",
  "mistralai/mistral-medium-3.5-128b",
  "mistralai/mistral-large-3-675b-instruct-2512",
  "stepfun-ai/step-3.7-flash",
  "qwen/qwen3.5-122b-a10b",
  "qwen/qwen3.5-397b-a17b",
  "openai/gpt-oss-120b",
  "google/diffusiongemma-26b-a4b-it",
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
  "deepseek/deepseek-chat-v3.1:free",
  "deepseek/deepseek-r1-0528:free",
  "tngtech/deepseek-r1t2-chimera:free",
  "moonshotai/kimi-k2:free",
  "z-ai/glm-4.5-air:free",
  "kwaipilot/kat-coder-pro:free",
  "meituan/longcat-flash-chat:free",
  "tngtech/tng-r1t-chimera:free",
  "minimax/minimax-m2.5:free",
  "stepfun/step-3.5-flash:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "arcee-ai/trinity-large-preview:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3.6-plus:free",
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
