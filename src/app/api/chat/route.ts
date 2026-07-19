import { chatHistoryService } from "@/features/chat-history/services/chat-history-service"
import { config } from "@/lib/config"
import { streamText } from "@/services/inference/inference-service"
import { InferenceProviderEnum } from "@/services/inference/schemas/provider-schema"
import { InferenceModelSchema } from "@/services/inference/types/inference-model"
import { type UIMessage, convertToModelMessages } from "ai"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { z } from "zod"

const ChatRequestBodySchema = z.object({
  provider: InferenceProviderEnum,
  messages: z.array(z.unknown()),
  model: z.string(),
  system: z.string().default(""),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  selectedFiles: z.array(z.string()).optional(),
  userPrompt: z.string().optional(),
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
      userPrompt,
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

    let modelMessages
    try {
      modelMessages = await convertToModelMessages(messages as UIMessage[])
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid messages format", details: String(err) },
        { status: 400 }
      )
    }

    const result = streamText({
      system,
      messages: modelMessages,
      inferenceModel: inferenceModelResult.data,
      config: { temperature, topP },
    })

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      onError: (error) => {
        console.error("[/api/chat] Stream error:", error)
        return "Error al generar la respuesta"
      },
      onFinish: async ({ responseMessage }) => {
        try {
          const textContent = responseMessage.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("\n\n")

          if (textContent) {
            const outputPath = path.join(config.STORAGE_PATH, "outputs")
            await mkdir(outputPath, { recursive: true })
            await writeFile(
              path.join(outputPath, "last-response.md"),
              textContent,
              "utf-8"
            )

            if (userPrompt) {
              await chatHistoryService.saveResponse({
                selectedFiles: selectedFiles || [],
                userPrompt: userPrompt,
                response: textContent,
              })
              revalidatePath("/chat")
            }
          }
        } catch (err) {
          console.error("[/api/chat] Error saving response automatically:", err)
        }
      },
    })
  } catch (error) {
    console.error("[/api/chat] Unhandled error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
