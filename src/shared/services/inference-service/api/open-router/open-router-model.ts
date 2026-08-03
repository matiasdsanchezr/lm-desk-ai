import { z } from "zod"

export const OpenRouterModelEnum = z.enum([
  "deepseek/deepseek-chat-v3.1:free",
  "deepseek/deepseek-r1-0528:free",
  "tngtech/deepseek-r1t2-chimera:free",
  "moonshotai/kimi-k2:free",
  "z-ai/glm-4.5-air:free",
  "kwaipilot/kat-coder-pro:free",
  "meituan/longcat-flash-chat:free",
  "tngtech/tng-r1t-chimera:free",
  "minimax/minimax-m2.5:free",
  "stepfun/step-3.5-flash:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "arcee-ai/trinity-large-preview:free",
  "openai/gpt-oss-120b:free",
  "qwen/qwen3.6-plus:free",
])
