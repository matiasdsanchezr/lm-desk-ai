import { z } from "zod"
import { AntigravityModelEnum } from "../api/antigravity/antigravity-model"
import { GeminiModelEnum } from "../api/google-genai/google-genai-models"
import { NvidiaNimModelEnum } from "../api/nvidia-nim/nvidia-nim-model"
import { OpenAIModelEnum } from "../api/open-ai/open-ai-model"
import { OpenRouterModelEnum } from "../api/open-router/open-router-model"
import {
  InferenceProvider,
  InferenceProviderEnum,
} from "../schemas/provider-schema"

const PROVIDER_MODELS_MAP = {
  genai: GeminiModelEnum,
  vertex: GeminiModelEnum,
  nvidiaNim: NvidiaNimModelEnum,
  openRouter: OpenRouterModelEnum,
  antigravity: AntigravityModelEnum,
  openai: OpenAIModelEnum,
} as const

export const NvidiaNimModelSchema = z
  .object({
    provider: z.literal(InferenceProviderEnum.enum.nvidiaNim),
    model: NvidiaNimModelEnum,
  })
  .required()
export type NvidiaNimModel = z.infer<typeof NvidiaNimModelSchema>

export const OpenRouterModelSchema = z
  .object({
    provider: z.literal(InferenceProviderEnum.enum.openRouter),
    model: OpenRouterModelEnum,
  })
  .required()
export type OpenRouterModel = z.infer<typeof OpenRouterModelSchema>

export const GenAiModelSchema = z
  .object({
    provider: z.literal(InferenceProviderEnum.enum.genai),
    model: GeminiModelEnum,
  })
  .required()
export type GenAiModel = z.infer<typeof GenAiModelSchema>

export const VertexModelSchema = z
  .object({
    provider: z.literal(InferenceProviderEnum.enum.vertex),
    model: GeminiModelEnum,
  })
  .required()
export type VertexModel = z.infer<typeof VertexModelSchema>

export const AgyCliModelSchema = z
  .object({
    provider: z.literal(InferenceProviderEnum.enum.antigravity),
    model: AntigravityModelEnum,
  })
  .required()
export type AgyCliModel = z.infer<typeof AgyCliModelSchema>

export const OpenAIModelSchema = z
  .object({
    provider: z.literal(InferenceProviderEnum.enum.openai),
    model: OpenAIModelEnum,
  })
  .required()
export type OpenAIModel = z.infer<typeof OpenAIModelSchema>

export const InferenceModelSchema = z
  .discriminatedUnion("provider", [
    NvidiaNimModelSchema,
    OpenRouterModelSchema,
    GenAiModelSchema,
    VertexModelSchema,
    AgyCliModelSchema,
    OpenAIModelSchema,
  ])
  .describe("Contenido del mensaje")

export type InferenceModel = z.infer<typeof InferenceModelSchema>

export const getModelsForProvider = (provider: InferenceProvider): string[] => {
  const providerModels = PROVIDER_MODELS_MAP[provider]
  return providerModels?.options || []
}
