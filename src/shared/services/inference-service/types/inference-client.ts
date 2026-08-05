import { generateText, streamText } from "ai"
import {
  GenerateTextOptions,
  StreamTextOptions,
} from "./inference-request-options"

export type InferenceClient = {
  generateText: (params: GenerateTextOptions) => ReturnType<typeof generateText>
  streamText: (params: StreamTextOptions) => ReturnType<typeof streamText>
}
