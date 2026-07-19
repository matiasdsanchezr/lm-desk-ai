import "server-only"

import { config } from "@/lib/config"
import { type GoogleLanguageModelOptions } from "@ai-sdk/google"
import { createVertex, GoogleVertexProvider } from "@ai-sdk/google-vertex"
import {
  type GenerateTextResult,
  type StreamTextResult,
  type ToolSet,
  Output,
  generateText as aiGenerateText,
  streamText as aiStreamText,
} from "ai"
import { InferenceClient } from "../../types/inference-client"
import { type InferenceRequestOptions } from "../../types/inference-request-options"
import {
  getThinkingConfig,
  googleDefaultOptions,
} from "../google-genai/google-genai-config"

export class GoogleVertexClient implements InferenceClient {
  private _providerInstance?: GoogleVertexProvider

  private getProvider() {
    if (!this._providerInstance) {
      this._providerInstance = createVertex({ apiKey: config.VERTEX_API_KEY })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: InferenceRequestOptions
  ): Promise<GenerateTextResult<ToolSet, never>> => {
    const vertex = this.getProvider()
    const thinkingConfig = getThinkingConfig(params)
    const result = await aiGenerateText({
      model: vertex(params.inferenceModel.model),
      system: params.system,
      messages: params.messages,
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxOutputTokens: params.config?.maxOutputTokens,
      output: params.responseJsonSchema
        ? Output.object({ schema: params.responseJsonSchema })
        : undefined,
      maxRetries: params.maxRetries ?? 0,
      providerOptions: {
        // Provider options correcto segun documentación
        vertex: {
          ...googleDefaultOptions,
          thinkingConfig,
        } satisfies GoogleLanguageModelOptions,
      },
      abortSignal: params.signal,
    })

    return result
  }

  public streamText = (
    params: InferenceRequestOptions
  ): StreamTextResult<ToolSet, never> => {
    const vertex = this.getProvider()
    const thinkingConfig = getThinkingConfig(params)
    const result = aiStreamText({
      model: vertex(params.inferenceModel.model),
      system: params.system,
      messages: params.messages,
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxOutputTokens: params.config?.maxOutputTokens,
      output: params.responseJsonSchema
        ? Output.object({ schema: params.responseJsonSchema })
        : undefined,
      providerOptions: {
        vertex: {
          ...googleDefaultOptions,
          thinkingConfig,
        } satisfies GoogleLanguageModelOptions,
      },
      abortSignal: params.signal,
    })

    return result
  }
}
