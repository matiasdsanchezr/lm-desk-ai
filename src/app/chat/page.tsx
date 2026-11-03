import { redirect } from "next/navigation"
import { connection } from "next/server"

export default async function NewChatPage() {
  await connection()
  const newChatId = `session-${Date.now()}`

  redirect(`/chat/${newChatId}`)
}
