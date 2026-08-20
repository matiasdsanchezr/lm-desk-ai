"use server"

import {
  buildProjectDependencyGraph,
  FileContent,
  isImageFile,
} from "@/shared/services/file-service"
import { ActionResponse } from "@/shared/types/action-state"
import { z } from "zod"

const fetchFileContextSchema = z.object({
  filePaths: z.array(z.string().trim().min(1)).min(0).max(200),
  includeDependencies: z.preprocess((val) => val === "true", z.boolean()),
})

type ProjectFileContext = {
  fileContents: FileContent[]
}

export async function fetchFileContextAction(
  _prev: unknown,
  formData: FormData
): ActionResponse<ProjectFileContext> {
  const parsed = fetchFileContextSchema.safeParse({
    filePaths: formData.getAll("filePath"),
    includeDependencies: formData.get("includeDependencies"),
  })

  if (!parsed.success || !parsed.data) {
    return { error: z.prettifyError(parsed.error) }
  }

  const { filePaths, includeDependencies } = parsed.data
  const textFilePaths = filePaths.filter((path) => !isImageFile(path))

  const fileContents = await buildProjectDependencyGraph(
    textFilePaths,
    includeDependencies
  )

  return {
    data: {
      fileContents,
    },
  }
}
