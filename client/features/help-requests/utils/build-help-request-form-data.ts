import type { CreateHelpRequestInput } from "../types"

export type HelpRequestFormFiles = {
  existingMedia: string[]
  newFiles: File[]
}

export function buildHelpRequestFormData(
  input: CreateHelpRequestInput,
  files: HelpRequestFormFiles
): FormData {
  const formData = new FormData()
  formData.append(
    "payload",
    JSON.stringify({
      ...input,
      existingMedia: files.existingMedia,
    })
  )

  for (const file of files.newFiles) {
    formData.append("files", file)
  }

  return formData
}

export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http") || url.startsWith("blob:")) {
    return url
  }
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:8000"
  return `${base}${url.startsWith("/") ? url : `/${url}`}`
}
