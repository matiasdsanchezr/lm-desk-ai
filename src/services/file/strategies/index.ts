import { LanguageStrategy, Extension } from "../types"
import { jsTsStrategy } from "./js-ts-strategy"
import { pythonStrategy } from "./python-strategy"
import { ALLOWED_NON_CODE_EXTENSIONS } from "../constants"

export const STRATEGIES: LanguageStrategy[] = [jsTsStrategy, pythonStrategy]

export const STRATEGY_BY_EXTENSION = new Map<Extension, LanguageStrategy>()
for (const strategy of STRATEGIES) {
  for (const ext of strategy.extensions) {
    STRATEGY_BY_EXTENSION.set(ext, strategy)
  }
}

export const CODE_EXTENSIONS: ReadonlySet<Extension> = new Set(
  STRATEGY_BY_EXTENSION.keys()
)

export const ALLOWED_EXTENSIONS: ReadonlySet<Extension> = new Set([
  ...CODE_EXTENSIONS,
  ...ALLOWED_NON_CODE_EXTENSIONS,
])
