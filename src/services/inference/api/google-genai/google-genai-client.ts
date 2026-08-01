import "server-only"

import { config } from "@/shared/lib/config"
import {
  GoogleGenerativeAIProvider,
  type GoogleLanguageModelOptions,
  createGoogleGenerativeAI,
} from "@ai-sdk/google"
import {
  Output,
  generateText as aiGenerateText,
  streamText as aiStreamText,
} from "ai"
import { type InferenceClient } from "../../types/inference-client"
import { type InferenceRequestOptions } from "../../types/inference-request-options"
import { getThinkingConfig, googleDefaultOptions } from "./google-genai-config"

export class GoogleGenAIClient implements InferenceClient {
  private _providerInstance?: GoogleGenerativeAIProvider

  private getProvider(): GoogleGenerativeAIProvider {
    if (!this._providerInstance) {
      this._providerInstance = createGoogleGenerativeAI({
        apiKey: config.GENAI_API_KEY,
      })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: InferenceRequestOptions
  ): ReturnType<typeof aiGenerateText> => {
    const thinkingConfig = getThinkingConfig(params)
    const google = this.getProvider()

    const result = await aiGenerateText({
      model: google(params.inferenceModel.model),
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
        google: {
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
    const thinkingConfig = getThinkingConfig(params)
    const google = this.getProvider()

    const result = aiStreamText({
      model: google(params.inferenceModel.model),
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
        google: {
          ...googleDefaultOptions,
          thinkingConfig,
        } satisfies GoogleLanguageModelOptions,
      },
      abortSignal: params.signal,
    })

    return result
  }
}
