import { getChatById } from "@/features/chat"
import { streamContext } from "@/features/chat/lib/resumable-stream"
import { UI_MESSAGE_STREAM_HEADERS } from "ai"

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params
  const chat = await getChatById(chatId)

  if (!chat || !chat.activeStreamId) {
    return new Response(null, { status: 204 })
  }

  return new Response(
    await streamContext.resumeExistingStream(chat.activeStreamId),
    { headers: UI_MESSAGE_STREAM_HEADERS }
  )
}
