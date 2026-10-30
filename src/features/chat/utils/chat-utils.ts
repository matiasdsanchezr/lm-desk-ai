import type { UIMessage } from "ai"
import type {
  ContextSource,
  FormatOptions,
  MyUIMessage,
  WebSource,
} from "../types"

interface BuildSourcesParams {
  includeContext: boolean
  selectedFilePaths: string[]
  crawledPages: Array<{ url: string; title?: string; content?: string }>
  selectedUrls: string[]
}

/**
 * Genera el arreglo unificado de ContextSource a partir del estado de los stores
 */
export function buildContextSourcesPayload({
  includeContext,
  selectedFilePaths,
  crawledPages,
  selectedUrls,
}: BuildSourcesParams): ContextSource[] {
  if (!includeContext) return []

  const fileSources: ContextSource[] = selectedFilePaths.map((path) => ({
    type: "file",
    path,
  }))

  const webSources: ContextSource[] = crawledPages
    .filter((p) => selectedUrls.includes(p.url) && p.content)
    .map(
      (p): WebSource => ({
        type: "web",
        url: p.url,
        title: p.title || p.url,
        content: p.content ?? "",
      })
    )

  return [...fileSources, ...webSources]
}

export function getMessagePart(
  message: UIMessage | undefined,
  type: "text" | "reasoning"
): string {
  if (!message?.parts) return ""

  return message.parts
    .filter((p) => p.type === type)
    .map((p) => (p as { text: string }).text)
    .join(type === "text" ? "" : "\n")
}

export function getContextSources(
  message: MyUIMessage | UIMessage | undefined
): ContextSource[] {
  if (!message?.parts) return []

  const part = message.parts.find((p) => p.type === "data-contextSources")
  if (part && "data" in part && Array.isArray(part.data)) {
    return part.data as ContextSource[]
  }

  return []
}

export function estimateTokenCountFromText(input: string): number {
  return Math.ceil(input.length / 4)
}

export function estimateTokenCountFromUIMessage(input: UIMessage[]): number {
  let totalChars = 0
  for (const msg of input) {
    if (!msg.parts) continue
    for (const part of msg.parts) {
      if ("text" in part && typeof part.text === "string") {
        totalChars += part.text.length
      }
    }
  }

  return Math.ceil(totalChars / 4)
}

function normalizeCodeBlocks(content: string): string {
  const codeBlockCount = (content.match(/```/g) || []).length
  return codeBlockCount % 2 !== 0 ? `${content.trimEnd()}\n\`\`\`` : content
}

export function formatConversationToMarkdown(
  messages: UIMessage[],
  options: FormatOptions = {}
): string {
  const {
    userLabel = "**Usuario:**",
    assistantLabel = "**Asistente:**",
    systemLabel = "**Sistema:**",
  } = options

  const roleMap: Record<string, string> = {
    user: userLabel,
    assistant: assistantLabel,
    system: systemLabel,
  }

  return messages
    .filter((msg) => msg.parts.length > 0)
    .map((msg) => {
      const label = roleMap[msg.role] || `**${msg.role}:**`
      const content = getMessagePart(msg, "text")
      const safeContent = normalizeCodeBlocks(content.trim())

      const contextSourcesPart = msg.parts?.find(
        (p) => p.type === "data-contextSources"
      ) as { type: string; data: ContextSource[] } | undefined
      const contextSources = contextSourcesPart?.data ?? []

      let contextSection = ""
      if (contextSources.length > 0) {
        contextSection =
          `\n\n> **Fuentes de contexto adjuntas (${contextSources.length}):**\n` +
          contextSources
            .map((s) => {
              if (s.type === "file") {
                return `> - \`${s.path}\``
              }
              return `> - [${s.title || s.url}](${s.url})`
            })
            .join("\n")
      }

      return `${label}\n\n${safeContent}${contextSection}`
    })
    .join("\n\n---\n\n")
}
