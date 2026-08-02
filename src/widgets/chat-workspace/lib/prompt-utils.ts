const DEFAULT_INSTRUCTIONS = `\
<system_instructions>
{{systemPrompt}}
</system_instructions>`

const DEFAULT_CONTEXT = `\
<context>
{{filesContent}}
</context>`

const DEFAULT_TASK = `## TAREA DEL USUARIO

{{userInput}}`

const SECTIONS_SEPARATOR = "\n\n---\n\n"

const SYSTEM_TAGS_REGEX =
  /<(\/?(?:system_instructions|context|file|userInput)\b[^>]*)>/gi

const sanitizeXmlContent = (content: string): string => {
  if (!content) return ""
  return content.replace(SYSTEM_TAGS_REGEX, "&lt;$1&gt;")
}
