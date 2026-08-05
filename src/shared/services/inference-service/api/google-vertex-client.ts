import "server-only"

import { config } from "@/shared/lib/config"
import { type GoogleLanguageModelOptions } from "@ai-sdk/google"
import { createVertex, GoogleVertexProvider } from "@ai-sdk/google-vertex"
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  Output,
} from "ai"
import { InferenceClient } from "../types/inference-client"
import {
  StreamTextOptions,
  type GenerateTextOptions,
} from "../types/inference-request-options"
import { googleDefaultSafety, toThinkingLevel } from "./google-helpers"

export class GoogleVertexClient implements InferenceClient {
  private _providerInstance?: GoogleVertexProvider

  private getProvider() {
    if (!this._providerInstance) {
      this._providerInstance = createVertex({ apiKey: config.VERTEX_API_KEY })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: GenerateTextOptions
  ): ReturnType<typeof aiGenerateText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params

    const vertex = this.getProvider()
    const result = await aiGenerateText({
      ...config,
      model: vertex(inferenceModel.model),
      output: responseJsonSchema
        ? Output.object({ schema: responseJsonSchema })
        : undefined,
      maxRetries: params.maxRetries ?? 0,
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
    const vertex = this.getProvider()
    const result = aiStreamText({
      ...config,
      model: vertex(inferenceModel.model),
      output: responseJsonSchema
        ? Output.object({ schema: responseJsonSchema })
        : undefined,
      maxRetries: params.maxRetries ?? 0,
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
