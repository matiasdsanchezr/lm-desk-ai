import {
  ChatRequestBodySchema,
  handleChatRequest,
} from "@/features/chat/services/chat-stream-service"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = ChatRequestBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Cuerpo inválido", details: parsed.error.issues },
        { status: 400 }
      )
    }

    return await handleChatRequest(parsed.data)
  } catch (error) {
    console.error("[/api/chat] Error no controlado:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
