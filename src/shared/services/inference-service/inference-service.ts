import "server-only"

import { config } from "@/shared/lib/config"
import { AntigravityClient } from "./api/antigravity/antigravity-client"
import { GoogleGenAIClient } from "./api/google-genai/google-genai-client"
import { GoogleVertexClient } from "./api/google-vertex/google-vertex-client"
import { NvidiaNimClient } from "./api/nvidia-nim/nvidia-nim-client"
import { OpenAiClient } from "./api/open-ai/open-ai-client"
import { OpenRouterClient } from "./api/open-router/open-router-client"
import { type InferenceProvider } from "./schemas/provider-schema"
import { type InferenceClient } from "./types/inference-client"
import { type InferenceRequestOptions } from "./types/inference-request-options"

const _clientCache = new Map<InferenceProvider, InferenceClient>()

const PROVIDER_FACTORIES: Record<InferenceProvider, () => InferenceClient> = {
  nvidiaNim: () => {
    if (!config.NVIDIA_NIM_API_KEY) {
      throw new Error("Falta NVIDIA_NIM_API_KEY")
    }
    return new NvidiaNimClient()
  },
  openRouter: () => {
    if (!config.OPEN_ROUTER_API_KEY) {
      throw new Error("Falta OPEN_ROUTER_API_KEY")
    }
    return new OpenRouterClient()
  },
  vertex: () => {
    if (!config.VERTEX_API_KEY) {
      throw new Error("Falta VERTEX_API_KEY")
    }
    return new GoogleVertexClient()
  },
  genai: () => {
    if (!config.GENAI_API_KEY) {
      throw new Error("Falta GENAI_API_KEY")
    }
    return new GoogleGenAIClient()
  },
  antigravity: () => {
    if (!config.ANTIGRAVITY_API_KEY) {
      throw new Error("Falta ANTIGRAVITY_API_KEY")
    }
    return new AntigravityClient()
  },
  openai: () => {
    if (!config.OPENAI_API_KEY) {
      throw new Error("Falta OPENAI_API_KEY")
    }
    return new OpenAiClient(
      config.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      config.OPENAI_API_KEY
    )
  },
}

function getClient(provider: InferenceProvider): InferenceClient {
  let client = _clientCache.get(provider)
  if (client) return client

  const providerFactory = PROVIDER_FACTORIES[provider]
  if (!providerFactory) {
    throw new Error(`Provider no soportado: ${provider}`)
  }

  try {
    client = providerFactory()
    _clientCache.set(provider, client)
    return client
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    throw new Error(`[Inference Configuration Error]: ${message}`)
  }
}

export async function generateText(requestOptions: InferenceRequestOptions) {
  const { provider } = requestOptions.inferenceModel
  return getClient(provider).generateText(requestOptions)
}

export function streamText(requestOptions: InferenceRequestOptions) {
  const { provider } = requestOptions.inferenceModel
  return getClient(provider).streamText(requestOptions)
}
