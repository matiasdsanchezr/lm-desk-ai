import { type ModelMessage } from "ai"
import { ChatHistoryBase } from "../types/chat-history-base"

export class ChatHistory implements ChatHistoryBase<ModelMessage, string> {
  private _messages: ModelMessage[] = []

  constructor(messages: ModelMessage[] = []) {
    this._messages = messages
  }

  public clone = () => {
    return new ChatHistory([...this._messages])
  }

  public setMessages = (messages: ModelMessage[]) => {
    this._messages = messages.map((message) => ({
      ...message,
      content: Array.isArray(message.content)
        ? [...message.content]
        : message.content,
    })) as ModelMessage[]
  }

  public getMessages = () => {
    return this._messages
  }

  public addMessage = (message: ModelMessage) => {
    this._messages.push(message)
  }

  public addUserMessage = (message: string) => {
    this._messages.push({
      role: "user",
      content: [{ type: "text", text: message }],
    })
  }

  public addAssistantMessage = (message: string) => {
    this._messages.push({
      role: "assistant",
      content: [{ type: "text", text: message }],
    })
  }

  public addSystemMessage = (message: string) => {
    this._messages.push({
      role: "system",
      content: message,
    })
  }
}
