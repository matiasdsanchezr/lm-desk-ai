import "server-only"

import { config } from "@/shared/lib/config"
import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from "@ai-sdk/openai-compatible"
import { generateText as aiGenerateText, streamText as aiStreamText } from "ai"
import { InferenceClient } from "../types/inference-client"
import {
  StreamTextOptions,
  type GenerateTextOptions,
} from "../types/inference-request-options"
import { jsonOutputInstruction } from "../utils/json-output-instruction"

export class OpenRouterClient implements InferenceClient {
  private _providerInstance?: OpenAICompatibleProvider

  private getProvider() {
    if (!this._providerInstance) {
      this._providerInstance = createOpenAICompatible({
        name: "openRouter",
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          Authorization: `Bearer ${config.OPEN_ROUTER_API_KEY}`,
        },
        includeUsage: true,
      })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: GenerateTextOptions
  ): ReturnType<typeof aiGenerateText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params
    const openRouter = this.getProvider()
    let instructions = config.instructions ?? ""
    if (responseJsonSchema) {
      const jsonInstruction = jsonOutputInstruction(responseJsonSchema)
      instructions = instructions
        ? `${instructions}\n\n${jsonInstruction}`
        : jsonInstruction
    }

    const result = await aiGenerateText({
      ...config,
      model: openRouter.chatModel(inferenceModel.model),
      maxRetries: config.maxRetries ?? 0,
      instructions,
      maxOutputTokens: config.maxOutputTokens
        ? Math.min(config.maxOutputTokens, 32768)
        : 32768,
      providerOptions: {
        openRouter: {
          response_format: responseJsonSchema
            ? { type: "json_object" }
            : undefined,
          chat_template_kwargs: {
            thinking: config.reasoning ?? true,
            enable_thinking: config.reasoning ?? true,
            clear_thinking: true,
          },
        },
      },
    })

    return result
  }

  public streamText = (
    params: StreamTextOptions
  ): ReturnType<typeof aiStreamText> => {
    const { inferenceModel, responseJsonSchema, ...config } = params
    const openRouter = this.getProvider()
    let instructions = config.instructions ?? ""
    if (responseJsonSchema) {
      const jsonInstruction = jsonOutputInstruction(responseJsonSchema)
      instructions = instructions
        ? `${instructions}\n\n${jsonInstruction}`
        : jsonInstruction
    }

    const result = aiStreamText({
      ...config,
      model: openRouter.chatModel(inferenceModel.model),
      maxRetries: config.maxRetries ?? 0,
      instructions,
      maxOutputTokens: config.maxOutputTokens
        ? Math.min(config.maxOutputTokens, 32768)
        : 32768,
      providerOptions: {
        openRouter: {
          response_format: responseJsonSchema
            ? { type: "json_object" }
            : undefined,
          chat_template_kwargs: {
            thinking: config.reasoning ?? true,
            enable_thinking: config.reasoning ?? true,
            clear_thinking: true,
          },
        },
      },
    })

    return result
  }
}
