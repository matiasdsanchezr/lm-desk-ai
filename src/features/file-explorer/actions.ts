"use server"

import { updateTag } from "next/cache"

export async function refreshFileTreeAction(): Promise<void> {
  updateTag("file-tree")
}
