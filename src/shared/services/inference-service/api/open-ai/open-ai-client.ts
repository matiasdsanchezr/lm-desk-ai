import "server-only"

import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai"
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  Output,
} from "ai"
import { type InferenceClient } from "../../types/inference-client"
import { type InferenceRequestOptions } from "../../types/inference-request-options"

export class OpenAiClient implements InferenceClient {
  private _providerInstance?: OpenAIProvider
  private readonly _baseURL: string
  private readonly _apiKey: string

  constructor(baseURL: string, apiKey: string) {
    this._baseURL = baseURL
    this._apiKey = apiKey
  }

  private getProvider(): OpenAIProvider {
    if (!this._providerInstance) {
      this._providerInstance = createOpenAI({
        apiKey: this._apiKey,
        baseURL: this._baseURL,
      })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: InferenceRequestOptions
  ): ReturnType<typeof aiGenerateText> => {
    const { model } = params.inferenceModel
    const provider = this.getProvider()
    const result = await aiGenerateText({
      model: provider.chat(model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      system: params.system,
      messages: params.messages,
      output: params.responseJsonSchema
        ? Output.object({ schema: params.responseJsonSchema })
        : undefined,
      abortSignal: params.signal,
    })

    return result
  }

  public streamText = (
    params: InferenceRequestOptions
  ): ReturnType<typeof aiStreamText> => {
    const { model } = params.inferenceModel
    const provider = this.getProvider()
    const result = aiStreamText({
      model: provider.chat(model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      system: params.system,
      messages: params.messages,
      output: params.responseJsonSchema
        ? Output.object({ schema: params.responseJsonSchema })
        : undefined,
      abortSignal: params.signal,
    })

    return result
  }
}
