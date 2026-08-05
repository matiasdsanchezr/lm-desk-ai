import "server-only"

import { createOpenAI, OpenAIProvider } from "@ai-sdk/openai"
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  Output,
} from "ai"
import { type InferenceClient } from "../types/inference-client"
import {
  StreamTextOptions,
  type GenerateTextOptions,
} from "../types/inference-request-options"

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
    params: GenerateTextOptions
  ): ReturnType<typeof aiGenerateText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params
    const provider = this.getProvider()
    const result = await aiGenerateText({
      ...config,
      model: provider.chat(inferenceModel.model),
      maxRetries: config.maxRetries ?? 0,
      output: responseJsonSchema
        ? Output.object({ schema: responseJsonSchema })
        : undefined,
    })

    return result
  }

  public streamText = (
    params: StreamTextOptions
  ): ReturnType<typeof aiStreamText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params
    const provider = this.getProvider()
    const result = aiStreamText({
      ...config,
      model: provider.chat(inferenceModel.model),
      maxRetries: config.maxRetries ?? 0,
      output: responseJsonSchema
        ? Output.object({ schema: responseJsonSchema })
        : undefined,
    })

    return result
  }
}
