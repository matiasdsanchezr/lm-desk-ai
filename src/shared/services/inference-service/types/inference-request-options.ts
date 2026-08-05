import { generateText, ModelMessage, streamText } from "ai"
import { type ZodType } from "zod"
import { type InferenceModel } from "./inference-model"

export type GenerateTextOptions = Omit<
  Parameters<typeof generateText>[0],
  "model" | "prompt"
> & {
  inferenceModel: InferenceModel
  responseJsonSchema?: ZodType
  messages: ModelMessage[]
}

export type StreamTextOptions = Omit<
  Parameters<typeof streamText>[0],
  "model" | "prompt"
> & {
  inferenceModel: InferenceModel
  responseJsonSchema?: ZodType
  messages: ModelMessage[]
}
