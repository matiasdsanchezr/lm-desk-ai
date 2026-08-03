import { generateText, streamText } from "ai"
import { InferenceRequestOptions } from "./inference-request-options"

export type InferenceClient = {
  generateText: (
    params: InferenceRequestOptions
  ) => ReturnType<typeof generateText>
  streamText: (params: InferenceRequestOptions) => ReturnType<typeof streamText>
}
