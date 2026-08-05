import "server-only"

import { config } from "@/shared/lib/config"
import { type TextStreamPart, type ToolSet } from "ai"
import { access, readFile } from "fs/promises"
import path from "path"

const SCRIPT_PATH = path.join(config.STORAGE_PATH, "scripts", "transform.js")

export type TextTransformFunction = (text: string) => string | Promise<string>

export async function applyPostProcessorScript(text: string): Promise<string> {
  try {
    await access(SCRIPT_PATH)
  } catch {
    return text
  }

  try {
    const sourceCode = await readFile(SCRIPT_PATH, "utf-8")

    const module = {
      exports: {} as
        | { default?: TextTransformFunction }
        | TextTransformFunction,
    }

    const runModule = new Function("module", "exports", sourceCode)
    runModule(module, module.exports)

    const transformFn =
      typeof module.exports === "function"
        ? module.exports
        : module.exports.default

    if (typeof transformFn === "function") {
      const result = await transformFn(text)
      return typeof result === "string" ? result : text
    }

    console.warn(
      "[PostProcessor] El script transform.js no exporta una función válida."
    )
  } catch (error) {
    console.error("[PostProcessor] Error al ejecutar transform.js:", error)
  }

  return text
}

export const postProcessorTransform =
  <TOOLS extends ToolSet>() =>
  (options: { tools: TOOLS; stopStream: () => void }) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async transform(chunk, controller) {
        controller.enqueue(
          chunk.type === "text-delta"
            ? { ...chunk, text: await applyPostProcessorScript(chunk.text) }
            : chunk
        )
      },
    })
