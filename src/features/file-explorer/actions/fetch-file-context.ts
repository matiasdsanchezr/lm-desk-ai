"use server"

import {
  buildProjectDependencyGraph,
  FileContent,
  isImageFile,
  readLocalImagesAsBase64,
} from "@/shared/services/file-service"
import { ActionResponse } from "@/shared/types/action-state"
import { ImageFile } from "@/shared/types/image-file"
import { z } from "zod"
import { fetchRemoteImageAsBase64 } from "../utils"

const fetchFileContextSchema = z.object({
  filePaths: z.array(z.string().trim().min(1)).min(0).max(200),
  includeDependencies: z.preprocess((val) => val === "true", z.boolean()),
  imageUrls: z.string().optional(),
})

type ProjectFileContext = {
  fileContents: FileContent[]
  imageFiles: ImageFile[]
}

export async function fetchFileContextAction(
  _prev: unknown,
  formData: FormData
): ActionResponse<ProjectFileContext> {
  const parsed = fetchFileContextSchema.safeParse({
    filePaths: formData.getAll("filePath"),
    includeDependencies: formData.get("includeDependencies"),
    imageUrls: formData.get("imageUrls") ?? "",
  })

  if (!parsed.success || !parsed.data) {
    return { error: z.prettifyError(parsed.error) }
  }

  const { filePaths, includeDependencies, imageUrls } = parsed.data

  const localImagePaths = filePaths.filter(isImageFile)
  const textFilePaths = filePaths.filter((path) => !isImageFile(path))
  let base64UrlImages: ImageFile[] = []
  const urls = imageUrls
    ?.split("\n")
    .map((src) => src.trim())
    .filter((src) => src.length > 0)

  if (urls && urls.length > 0) {
    base64UrlImages = await Promise.all(
      urls.map((src) => fetchRemoteImageAsBase64(src).catch(() => null))
    ).then((res) => res.filter((img): img is ImageFile => img !== null))
  }

  const localImages = await readLocalImagesAsBase64(localImagePaths)
  const fileContents = await buildProjectDependencyGraph(
    textFilePaths,
    includeDependencies
  )

  return {
    data: {
      fileContents,
      imageFiles: [...base64UrlImages, ...localImages],
    },
  }
}
