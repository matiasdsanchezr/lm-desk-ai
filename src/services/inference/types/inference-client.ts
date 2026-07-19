import { GenerateTextResult, StreamTextResult, ToolSet } from "ai"
import { InferenceRequestOptions } from "./inference-request-options"

export type InferenceClient = {
  generateText: (
    params: InferenceRequestOptions
  ) => Promise<GenerateTextResult<ToolSet, never>>
  streamText: (
    params: InferenceRequestOptions
  ) => StreamTextResult<ToolSet, never>
}
