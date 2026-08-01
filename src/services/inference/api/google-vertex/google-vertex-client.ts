import "server-only"

import { config } from "@/shared/lib/config"
import { type GoogleLanguageModelOptions } from "@ai-sdk/google"
import { createVertex, GoogleVertexProvider } from "@ai-sdk/google-vertex"
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  Output,
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
  ): ReturnType<typeof aiGenerateText> => {
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
  ): ReturnType<typeof aiStreamText> => {
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
