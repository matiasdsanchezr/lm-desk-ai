import z from "zod"

export const NvidiaNimModelEnum = z.enum([
  "z-ai/glm-5.2",
  "minimaxai/minimax-m2.7",
  "minimaxai/minimax-m3",
  "deepseek-ai/deepseek-v4-flash",
  "deepseek-ai/deepseek-v4-pro",
  "nvidia/nemotron-3-ultra-550b-a55b",
  "mistralai/mistral-medium-3.5-128b",
  "mistralai/mistral-large-3-675b-instruct-2512",
  "stepfun-ai/step-3.7-flash",
  "qwen/qwen3.5-122b-a10b",
  "qwen/qwen3.5-397b-a17b",
  "openai/gpt-oss-120b",
  "google/diffusiongemma-26b-a4b-it",
])
