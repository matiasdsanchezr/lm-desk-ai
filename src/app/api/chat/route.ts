import { chatHistoryService } from "@/features/chat-history/services/chat-history-service"
import { streamText } from "@/shared/services/inference-service/inference-service"
import { InferenceProviderEnum } from "@/shared/services/inference-service/schemas/provider-schema"
import { InferenceModelSchema } from "@/shared/services/inference-service/types/inference-model"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  toUIMessageStream,
} from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

const ChatRequestBodySchema = z.object({
  chatId: z.string().optional(),
  provider: InferenceProviderEnum,
  messages: z.array(z.unknown()),
  model: z.string(),
  system: z.string().default(""),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  selectedFiles: z.array(z.string()).optional(),
  includeReasoning: z.boolean().default(true),
})

export async function POST(req: Request) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es un JSON válido" },
        { status: 400 }
      )
    }

    const parsedBody = ChatRequestBodySchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Cuerpo de solicitud inválido",
          details: parsedBody.error.issues,
        },
        { status: 400 }
      )
    }
    const {
      chatId,
      provider,
      messages,
      model,
      system,
      temperature,
      topP,
      selectedFiles,
      includeReasoning,
    } = parsedBody.data

    const inferenceModelResult = InferenceModelSchema.safeParse({
      model,
      provider,
    })
    if (!inferenceModelResult.success) {
      return NextResponse.json(
        {
          error: "Configuración del modelo de inferencia inválida",
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

    const messagesToProcess = includeReasoning
      ? validatedMessages.data
      : validatedMessages.data.map((msg) => {
          if (msg.role === "assistant" && Array.isArray(msg.parts)) {
            return {
              ...msg,
              parts: msg.parts.filter((part) => part.type !== "reasoning"),
            }
          }
          return msg
        })

    const modelMessages = await convertToModelMessages(messagesToProcess)

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
                console.error("[/api/chat] Error en el stream:", error)
                return "Error al generar la respuesta"
              },
              onFinish: async ({ messages, responseMessage }) => {
                try {
                  let textContent = ""
                  for (const part of responseMessage.parts) {
                    if (part.type === "text") {
                      textContent += (textContent ? "\n\n" : "") + part.text
                    }
                  }

                  if (textContent) {
                    if (chatId) {
                      try {
                        await chatHistoryService.updateChat(chatId, {
                          messages,
                        })
                      } catch {
                        await chatHistoryService.saveChat({
                          id: chatId,
                          selectedFiles: selectedFiles || [],
                          messages,
                        })
                      }
                    } else {
                      await chatHistoryService.saveChat({
                        selectedFiles: selectedFiles || [],
                        messages,
                      })
                    }
                  }
                } catch (err) {
                  console.error(
                    "[/api/chat] Error al guardar el chat automáticamente:",
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
    console.error("[/api/chat] Error no controlado:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
