import { ModelMessage } from "ai"
import { type ZodType } from "zod"
import { type InferenceModel } from "./inference-model"

export type InferenceRequestOptions = {
  /**
   * Objeto unificado provider+model.
   * Usar InferenceModelSchema.parse(...) al construir desde input no tipado
   * (formularios, URL params, payloads de API) para garantizar combinaciones válidas.
   */
  inferenceModel: InferenceModel
  system?: string
  messages: ModelMessage[]
  contextInfo?: string
  debug?: boolean
  responseJsonSchema?: ZodType
  signal?: AbortSignal
  config?: {
    temperature?: number
    topP?: number
    topK?: number
    maxOutputTokens?: number
  }
  enableThinking?: boolean
  includeThoughts?: boolean
  maxRetries?: number
}

/**
 * Helper opcional para extraer campos sueltos si algún cliente
 * aún los necesita por separado (transitorio durante el refactor).
 */
export const getProviderAndModel = (opts: InferenceRequestOptions) => ({
  provider: opts.inferenceModel.provider,
  model: opts.inferenceModel.model,
})
