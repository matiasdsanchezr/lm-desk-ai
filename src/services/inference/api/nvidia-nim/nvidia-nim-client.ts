import "server-only"

import { config } from "@/lib/config"
import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from "@ai-sdk/openai-compatible"
import {
  type GenerateTextResult,
  type StreamTextResult,
  type ToolSet,
  generateText as aiGenerateText,
  streamText as aiStreamText,
} from "ai"
import { InferenceClient } from "../../types/inference-client"
import { type InferenceRequestOptions } from "../../types/inference-request-options"
import { jsonOutputInstruction } from "../../utils/json-output-instruction"

export class NvidiaNimClient implements InferenceClient {
  private _providerInstance?: OpenAICompatibleProvider

  private getProvider() {
    if (!this._providerInstance) {
      this._providerInstance = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        headers: {
          Authorization: `Bearer ${config.NVIDIA_NIM_API_KEY}`,
        },
        includeUsage: true,
      })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: InferenceRequestOptions
  ): Promise<GenerateTextResult<ToolSet, never>> => {
    const nvidiaNim = this.getProvider()
    const system = params.responseJsonSchema
      ? jsonOutputInstruction(params.responseJsonSchema)
      : params.system

    const result = await aiGenerateText({
      model: nvidiaNim.chatModel(params.inferenceModel.model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      system,
      messages: params.messages,
      maxOutputTokens: 16000,
      providerOptions: {
        // Output nativo de AiSdk no soportado. Se usa configuraciones custom
        nim: {
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
  ): StreamTextResult<ToolSet, never> => {
    const nvidiaNim = this.getProvider()
    const system = params.responseJsonSchema
      ? jsonOutputInstruction(params.responseJsonSchema)
      : params.system

    const result = aiStreamText({
      model: nvidiaNim.chatModel(params.inferenceModel.model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      system,
      messages: params.messages,
      maxOutputTokens: 16000,
      providerOptions: {
        nim: {
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
