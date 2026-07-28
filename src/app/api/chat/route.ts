import { chatHistoryService } from "@/features/chat-history/services/chat-history-service"
import { streamText } from "@/services/inference/inference-service"
import { InferenceProviderEnum } from "@/services/inference/schemas/provider-schema"
import { InferenceModelSchema } from "@/services/inference/types/inference-model"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  toUIMessageStream,
} from "ai"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"

const ChatRequestBodySchema = z.object({
  provider: InferenceProviderEnum,
  messages: z.array(z.unknown()),
  model: z.string(),
  system: z.string().default(""),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  selectedFiles: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Request body is not valid JSON" },
        { status: 400 }
      )
    }

    const parsedBody = ChatRequestBodySchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsedBody.error.issues },
        { status: 400 }
      )
    }
    const {
      provider,
      messages,
      model,
      system,
      temperature,
      topP,
      selectedFiles,
    } = parsedBody.data

    const inferenceModelResult = InferenceModelSchema.safeParse({
      model,
      provider,
    })
    if (!inferenceModelResult.success) {
      return NextResponse.json(
        {
          error: "Invalid inference model configuration",
          details: inferenceModelResult.error.issues,
        },
        { status: 400 }
      )
    }

    const validatedMessages = await safeValidateUIMessages({
      messages,
    })
    if (!validatedMessages.success) {
      throw new Error(validatedMessages.error.message)
    }

    const modelMessages = await convertToModelMessages(validatedMessages.data)

    return createUIMessageStreamResponse({
      status: 200,
      statusText: "OK",
      stream: createUIMessageStream({
        execute({ writer }) {
          const result = streamText({
            system,
            messages: modelMessages,
            inferenceModel: inferenceModelResult.data,
            config: { temperature, topP },
          })

          writer.merge(
            toUIMessageStream({
              stream: result.stream,
              originalMessages: validatedMessages.data,
              sendReasoning: true,
              onError: (error: unknown) => {
                console.error("[/api/chat] Stream error:", error)
                return "Error al generar la respuesta"
              },
              onFinish: async ({ messages, responseMessage }) => {
                try {
                  let textContent = ""
                  let reasoningContent = ""

                  for (const part of responseMessage.parts) {
                    if (part.type === "text") {
                      textContent += (textContent ? "\n\n" : "") + part.text
                    } else if (part.type === "reasoning") {
                      reasoningContent +=
                        (reasoningContent ? "\n\n" : "") + part.text
                    }
                  }

                  if (textContent) {
                    await chatHistoryService.saveChat({
                      selectedFiles: selectedFiles || [],
                      messages,
                    })
                    revalidatePath("/chat")
                  }
                } catch (err) {
                  console.error(
                    "[/api/chat] Error saving response automatically:",
                    err
                  )
                }
              },
            })
          )
        },
      }),
    })
  } catch (error) {
    console.error("[/api/chat] Unhandled error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
