import "server-only"

import { config } from "@/lib/config"
import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from "@ai-sdk/openai-compatible"
import {
  type ToolSet,
  generateText as aiGenerateText,
  streamText as aiStreamText,
  stepCountIs,
  tool,
} from "ai"
import { type InferenceClient } from "../../types/inference-client"
import { type InferenceRequestOptions } from "../../types/inference-request-options"

export class AntigravityClient implements InferenceClient {
  private _providerInstance?: OpenAICompatibleProvider

  private getProvider() {
    if (!this._providerInstance) {
      this._providerInstance = createOpenAICompatible({
        name: "cliProxyApi",
        baseURL: config.ANTIGRAVITY_BASE_URL ?? "",
        headers: {
          Authorization: `Bearer ${config.ANTIGRAVITY_API_KEY ?? ""}`,
        },
        includeUsage: true,
      })
    }
    return this._providerInstance
  }

  public generateText = async (
    params: InferenceRequestOptions
  ): ReturnType<typeof aiGenerateText> => {
    const antigravity = this.getProvider()
    const tools: ToolSet | undefined = params.responseJsonSchema
      ? {
          finalOutput: tool({
            description:
              "Esta herramienta debe ser llamada para entregar la respuesta final en formato JSON; siempre entrega la respuesta a través de esta herramienta",
            inputSchema: params.responseJsonSchema,
            strict: true,
          }),
        }
      : undefined
    const result = await aiGenerateText({
      model: antigravity.chatModel(params.inferenceModel.model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      tools,
      toolChoice: params.responseJsonSchema ? "required" : undefined,
      stopWhen: stepCountIs(1),
      system: params.system,
      messages: params.messages,
      abortSignal: params.signal,
    })

    return result
  }

  public streamText = (
    params: InferenceRequestOptions
  ): ReturnType<typeof aiStreamText> => {
    const antigravity = this.getProvider()
    const tools: ToolSet | undefined = params.responseJsonSchema
      ? {
          finalOutput: tool({
            description:
              "Esta herramienta debe ser llamada para entregar la respuesta final en formato JSON; siempre entrega la respuesta a través de esta herramienta",
            inputSchema: params.responseJsonSchema,
            strict: true,
          }),
        }
      : undefined
    const result = aiStreamText({
      model: antigravity.chatModel(params.inferenceModel.model),
      temperature: params.config?.temperature,
      topP: params.config?.topP,
      topK: params.config?.topK,
      maxRetries: params.maxRetries ?? 0,
      tools,
      toolChoice: params.responseJsonSchema ? "required" : undefined,
      stopWhen: stepCountIs(1),
      system: params.system,
      messages: params.messages,
      abortSignal: params.signal,
    })

    return result
  }
}
