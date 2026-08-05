import "server-only"

import { config } from "@/shared/lib/config"
import {
  GoogleGenerativeAIProvider,
  createGoogle,
  type GoogleLanguageModelOptions,
} from "@ai-sdk/google"
import {
  Output,
  generateText as aiGenerateText,
  streamText as aiStreamText,
} from "ai"
import { type InferenceClient } from "../types/inference-client"
import {
  StreamTextOptions,
  type GenerateTextOptions,
} from "../types/inference-request-options"
import { googleDefaultSafety, toThinkingLevel } from "./google-helpers"

export class GoogleClient implements InferenceClient {
  private _providerInstance?: GoogleGenerativeAIProvider

  private getProvider(): GoogleGenerativeAIProvider {
    if (!this._providerInstance) {
      this._providerInstance = createGoogle({
        apiKey: config.GOOGLE_API_KEY,
      })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: GenerateTextOptions
  ): ReturnType<typeof aiGenerateText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params
    const google = this.getProvider()

    const result = await aiGenerateText({
      ...config,
      model: google(inferenceModel.model),
      output: responseJsonSchema
        ? Output.object({ schema: responseJsonSchema })
        : undefined,
      maxRetries: config.maxRetries ?? 0,
      providerOptions: {
        google: {
          ...googleDefaultSafety,
          thinkingConfig: {
            includeThoughts: true,
            thinkingLevel: toThinkingLevel(params.reasoning),
          },
        } satisfies GoogleLanguageModelOptions,
      },
    })

    return result
  }

  public streamText = (
    params: StreamTextOptions
  ): ReturnType<typeof aiStreamText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params
    const google = this.getProvider()

    const result = aiStreamText({
      ...config,
      model: google(inferenceModel.model),
      output: responseJsonSchema
        ? Output.object({ schema: responseJsonSchema })
        : undefined,
      maxRetries: config.maxRetries ?? 0,
      providerOptions: {
        google: {
          ...googleDefaultSafety,
          thinkingConfig: {
            includeThoughts: true,
            thinkingLevel: toThinkingLevel(params.reasoning),
          },
        } satisfies GoogleLanguageModelOptions,
      },
    })

    return result
  }
}
