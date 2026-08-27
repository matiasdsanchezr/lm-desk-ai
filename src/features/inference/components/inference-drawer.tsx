import { cacheLife, cacheTag } from "next/cache"
import { getSystemPromptsList } from "../queries"
import { InferenceDrawerContent } from "./inference-drawer-content"

export async function InferenceDrawer() {
  "use cache"
  cacheTag("system-prompts-list")
  cacheLife("days")

  const initialPromptsPromise = getSystemPromptsList()

  return (
    <InferenceDrawerContent initialPromptsPromise={initialPromptsPromise} />
  )
}
