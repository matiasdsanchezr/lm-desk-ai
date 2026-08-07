import "server-only"

import { config } from "@/shared/lib/config"
import type { TextStreamPart, ToolSet } from "ai"
import { access, readFile } from "fs/promises"
import { basename, join } from "path"

export type TextTransformFunction = (text: string) => string | Promise<string>

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
  scriptName: string = "post-transform.js"
): Promise<string> {
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
