import "server-only"

import { config } from "@/shared/lib/config"
import type { ModelMessage, TextStreamPart, ToolSet } from "ai"
import { access, readFile } from "fs/promises"
import { basename, join } from "path"

export type TextTransformFunction = (text: string) => string

/**
 * Carga y evalúa un script de transformación desde el sistema de archivos.
 * Se separa para evitar leer y compilar el archivo por cada token del stream.
 */
async function loadTransformFunction(
  scriptName: string
): Promise<TextTransformFunction | null> {
  const safeScriptName = basename(scriptName)
  const scriptPath = join(config.STORAGE_PATH, "scripts", safeScriptName)

  try {
    await access(scriptPath)
  } catch {
    return null
  }

  try {
    const sourceCode = await readFile(scriptPath, "utf-8")
    const genericModule = {
      exports: {} as
        | { default?: TextTransformFunction }
        | TextTransformFunction,
    }

    const runModule = new Function("module", "exports", sourceCode)
    runModule(genericModule, genericModule.exports)

    const transformFn =
      typeof genericModule.exports === "function"
        ? genericModule.exports
        : genericModule.exports.default

    if (typeof transformFn === "function") {
      return transformFn as TextTransformFunction
    }

    console.warn(
      `[ScriptTransformer] El script ${safeScriptName} no exporta una función válida.`
    )
    return null
  } catch (error) {
    console.error(
      `[ScriptTransformer] Error al compilar ${safeScriptName}:`,
      error
    )
    return null
  }
}

/**
 * Aplica un script de transformación a un texto estático completo.
 * @param text - Texto a transformar.
 * @param scriptName - Nombre del archivo del script (ej: "transform.js").
 */
export async function applyTransformScript(
  text: string,
  scriptName?: string
): Promise<string> {
  if (!scriptName) return text

  const transformFn = await loadTransformFunction(scriptName)

  if (!transformFn) return text

  try {
    const result = await transformFn(text)
    return typeof result === "string" ? result : text
  } catch (error) {
    console.error(`[ScriptTransformer] Error ejecutando ${scriptName}:`, error)
    return text
  }
}

export async function applyTransformScriptToModelMessages(
  messages: ModelMessage[],
  scriptName?: string
): Promise<ModelMessage[]> {
  if (!scriptName) return messages

  const transformFn = await loadTransformFunction(scriptName)
  if (!transformFn) return messages

  try {
    const result: ModelMessage[] = new Array(messages.length)

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i]
      if (m.role === "tool" || m.role === "system") {
        result[i] = m
        continue
      }

      const content = m.content

      if (typeof content === "string") {
        const transformed = transformFn(content)
        result[i] = transformed === content ? m : { ...m, content: transformed }
      } else {
        let changed = false
        const newParts = new Array(content.length)

        for (let j = 0; j < content.length; j++) {
          const c = content[j]
          if (c.type === "text") {
            const newText = transformFn(c.text)
            if (newText !== c.text) {
              changed = true
              newParts[j] = { ...c, text: newText }
            } else {
              newParts[j] = c
            }
          } else {
            newParts[j] = c
          }
        }

        result[i] = changed ? { ...m, content: newParts } : m
      }
    }

    return result
  } catch (error) {
    console.error(`[ScriptTransformer] Error ejecutando ${scriptName}:`, error)
    return messages
  }
}

/**
 * Crea un TransformStream para el Vercel AI SDK.
 * @param scriptName - Nombre del archivo del script (ej: "transform.js").
 */
export const createScriptTransformStream =
  <TOOLS extends ToolSet>(scriptName: string = "post-transform.js") =>
  () => {
    let transformFn: TextTransformFunction | null = null

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async start() {
        transformFn = await loadTransformFunction(scriptName)
      },
      async transform(chunk, controller) {
        if (chunk.type === "text-delta" && transformFn) {
          try {
            const transformedText = await transformFn(chunk.text)
            controller.enqueue({
              ...chunk,
              text:
                typeof transformedText === "string"
                  ? transformedText
                  : chunk.text,
            })
          } catch {
            controller.enqueue(chunk)
          }
        } else {
          controller.enqueue(chunk)
        }
      },
    })
  }
