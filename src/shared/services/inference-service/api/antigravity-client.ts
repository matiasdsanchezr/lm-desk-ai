import "server-only"

import { config } from "@/shared/lib/config"
import {
  createOpenAICompatible,
  OpenAICompatibleProvider,
} from "@ai-sdk/openai-compatible"
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  tool,
  type ToolSet,
} from "ai"
import { ZodType } from "zod"
import { type InferenceClient } from "../types/inference-client"
import {
  StreamTextOptions,
  type GenerateTextOptions,
} from "../types/inference-request-options"

const getTools = (responseJsonSchema?: ZodType) =>
  responseJsonSchema
    ? ({
        finalOutput: tool({
          description:
            "Esta herramienta debe ser llamada para entregar la respuesta final en formato JSON; siempre entrega la respuesta a través de esta herramienta",
          inputSchema: responseJsonSchema,
          strict: true,
        }),
      } as ToolSet)
    : undefined

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
    params: GenerateTextOptions
  ): ReturnType<typeof aiGenerateText> => {
    const antigravity = this.getProvider()
    const { inferenceModel, responseJsonSchema, ...config } = params
    const tools = getTools(responseJsonSchema)
    const result = await aiGenerateText({
      ...config,
      model: antigravity.chatModel(inferenceModel.model),
      reasoning: config.reasoning || "high",
      tools,
      toolChoice: responseJsonSchema ? "required" : undefined,
      maxRetries: config.maxRetries ?? 0,
      // providerOptions: {
      //   cliProxyApi: {
      //     generationConfig: {
      //       thinkingConfig: {
      //         thinkingBudget: 30000,
      //         includeThoughts: true,
      //       },
      //     },
      //     thinkingConfig: {
      //       thinkingBudget: 30000,
      //       includeThoughts: true,
      //     },
      //   },
      // }
    })

    return result
  }

  public streamText = (
    params: StreamTextOptions
  ): ReturnType<typeof aiStreamText> => {
    const antigravity = this.getProvider()
    const { inferenceModel, responseJsonSchema, ...config } = params
    const tools = getTools(responseJsonSchema)
    const result = aiStreamText({
      ...config,
      model: antigravity.chatModel(inferenceModel.model),
      reasoning: config.reasoning || "high",
      tools,
      toolChoice: responseJsonSchema ? "required" : undefined,
      maxRetries: config.maxRetries ?? 0,
    })

    return result
  }
}
