"use server"

import { loadLocalImages, loadProjectGraph } from "@/entities/file/api/file-service"
import { ActionState } from "@/shared/types/action-state"
import { FileContent } from "@/entities/file/model/types"
import { ImageFile } from "@/shared/types/image-file"
import { fetchImage, isImagePath } from "@/entities/file/lib/image-utils"
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

  const { filePaths, includeDependencies, imageUrls } = parsed.data

  const localImagePaths = filePaths.filter(isImagePath)
  const textFilePaths = filePaths.filter((path) => !isImagePath(path))

  // 1. Cargar imágenes por URL
  let base64UrlImages: ImageFile[] = []
  const urls = imageUrls
    ?.split("\n")
    .map((src) => src.trim())
    .filter((src) => src.length > 0)

  if (urls && urls.length > 0) {
    base64UrlImages = await Promise.all(
      urls.map((src) => fetchImage(src).catch(() => null))
    ).then((res) => res.filter((img): img is ImageFile => img !== null))
  }

  // 2. Cargar imágenes del sistema de archivos local a través del servicio
  const localImages = await loadLocalImages(localImagePaths)

  // 3. Analizar código y dependencias
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
