import z from "zod"

export const GetFileContentsSchema = z.object({
  filePaths: z.array(z.string().trim().min(1)).min(0).max(200),
  includeDependencies: z.preprocess((val) => val === "true", z.boolean()),
  imageUrls: z.string().optional(),
})
