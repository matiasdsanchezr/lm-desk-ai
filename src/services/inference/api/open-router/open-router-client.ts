import "server-only"

import { config } from "@/lib/config"
import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from "@ai-sdk/openai-compatible"
import { generateText as aiGenerateText, streamText as aiStreamText } from "ai"
import { InferenceClient } from "../../types/inference-client"
import { type InferenceRequestOptions } from "../../types/inference-request-options"
import { jsonOutputInstruction } from "../../utils/json-output-instruction"

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
    params: InferenceRequestOptions
  ): ReturnType<typeof aiGenerateText> => {
    const openRouter = this.getProvider()
    const system = params.responseJsonSchema
      ? jsonOutputInstruction(params.responseJsonSchema)
      : params.system
    const result = await aiGenerateText({
      model: openRouter.chatModel(params.inferenceModel.model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      system,
      messages: params.messages,
      providerOptions: {
        // Output nativo de AiSdk no soportado. Se usa configuración especifica de Open Router
        openRouter: {
          response_format: params.responseJsonSchema
            ? { type: "json_object" }
            : undefined,
          chat_template_kwargs: {
            thinking: params.enableThinking ?? true,
            enable_thinking: params.enableThinking ?? true,
            clear_thinking: !(params.includeThoughts ?? true),
          },
        },
      },
      abortSignal: params.signal,
    })

    return result
  }

  public streamText = (
    params: InferenceRequestOptions
  ): ReturnType<typeof aiStreamText> => {
    const openRouter = this.getProvider()
    const system = params.responseJsonSchema
      ? jsonOutputInstruction(params.responseJsonSchema)
      : params.system
    const result = aiStreamText({
      model: openRouter.chatModel(params.inferenceModel.model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      system,
      messages: params.messages,
      providerOptions: {
        // Output nativo de AiSdk no soportado. Se usa configuración especifica de Open Router
        openRouter: {
          response_format: params.responseJsonSchema
            ? { type: "json_object" }
            : undefined,
          chat_template_kwargs: {
            thinking: params.enableThinking ?? true,
            enable_thinking: params.enableThinking ?? true,
            clear_thinking: !(params.includeThoughts ?? true),
          },
        },
      },
      abortSignal: params.signal,
    })

    return result
  }
}
