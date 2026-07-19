"use server"

import { fetchImage } from "@/features/chat/actions/fetch-image"
import { fileService } from "@/services/file/file-service"
import { ActionState } from "@/types/action-state"
import { FileContent } from "@/types/file-content"
import { ImageFile } from "@/types/image-file"
import { z } from "zod"

const GeneratePromptSchema = z.object({
  filePaths: z.array(z.string().trim().min(1)).min(0).max(200),
  includeDependencies: z.preprocess((val) => val === "true", z.boolean()),
  imageUrls: z.string().optional(),
})

type GetFileContentsState = {
  fileContents: FileContent[]
  imageFiles: ImageFile[]
}

export async function getFileContents(
  _prev: ActionState<GetFileContentsState>,
  formData: FormData
): Promise<ActionState<GetFileContentsState>> {
  const parsed = GeneratePromptSchema.safeParse({
    filePaths: formData.getAll("filePath"),
    includeDependencies: formData.get("includeDependencies"),
    imageUrls: formData.get("imageUrls"),
  })

  if (!parsed.success || !parsed.data) {
    return { error: z.prettifyError(parsed.error) }
  }

  let base64Images: ImageFile[] = []
  const urls = parsed.data.imageUrls
    ?.split("\n")
    .map((src) => src.trim())
    .filter((src) => src.length > 0)

  if (urls) {
    base64Images = await Promise.all(urls.map((src) => fetchImage(src)))
  }

  const fileContents = await fileService.loadProjectGraph(
    parsed.data.filePaths,
    parsed.data.includeDependencies
  )

  return { data: { fileContents, imageFiles: base64Images } }
}
