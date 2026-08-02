"use server"

import { loadLocalImages, loadProjectGraph } from "@/entities/file/api/file-api"
import { fetchImage, isImagePath } from "@/entities/file/lib/image-utils"
import type { FileContents, ImageFile } from "@/entities/file/model/file-types"
import type { ActionState } from "@/shared/types/action-state"
import { z } from "zod"
import { GetFileContentsSchema } from "../model/file-explorer-schemas"

export const getFileContents = async (
  _prev: ActionState<FileContents>,
  formData: FormData
): Promise<ActionState<FileContents>> => {
  const parsed = GetFileContentsSchema.safeParse({
    filePaths: formData.getAll("filePath"),
    includeDependencies: formData.get("includeDependencies"),
    imageUrls: formData.get("imageUrls"),
  })

  if (!parsed.success || !parsed.data) {
    return { error: z.prettifyError(parsed.error) }
  }
  const { filePaths, includeDependencies, imageUrls } = parsed.data

  const localImagePaths = filePaths.filter(isImagePath)
  const textFilePaths = filePaths.filter((path) => !isImagePath(path))

  const imagesToFetch = imageUrls
    ?.split("\n")
    .map((src) => src.trim())
    .filter((src) => src.length > 0)

  let base64UrlImages: ImageFile[] = []
  if (imagesToFetch && imagesToFetch.length > 0) {
    base64UrlImages = await Promise.all(
      imagesToFetch.map((src) => fetchImage(src).catch(() => null))
    ).then((res) => res.filter((img): img is ImageFile => img !== null))
  }

  const localImages = await loadLocalImages(localImagePaths)
  const fileContents = await loadProjectGraph(
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
