import { ALLOWED_NON_CODE_EXTENSIONS, IMAGE_EXTENSIONS } from "../lib/constants"
import { Extension, LanguageStrategy } from "../model/file-types"
import { jsTsStrategy } from "./js-ts-strategy"
import { pythonStrategy } from "./python-strategy"

const registeredStrategies: LanguageStrategy[] = [jsTsStrategy, pythonStrategy]

const strategyMap = new Map<Extension, LanguageStrategy>()

for (const strategy of registeredStrategies) {
  for (const ext of strategy.extensions) {
    strategyMap.set(ext, strategy)
  }
}

export function getStrategyForExtension(
  ext: Extension
): LanguageStrategy | undefined {
  return strategyMap.get(ext)
}

export const CODE_EXTENSIONS: ReadonlySet<Extension> = new Set(
  strategyMap.keys()
)

export const ALLOWED_EXTENSIONS: ReadonlySet<Extension> = new Set([
  ...CODE_EXTENSIONS,
  ...ALLOWED_NON_CODE_EXTENSIONS,
  ...IMAGE_EXTENSIONS,
])
