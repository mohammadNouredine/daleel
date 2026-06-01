import type { CreatePropertyListingInput } from "../types"

export type PropertyListingFormFiles = {
  existingImages: string[]
  newFiles: File[]
}

export function buildPropertyListingFormData(
  input: CreatePropertyListingInput,
  files: PropertyListingFormFiles
): FormData {
  const formData = new FormData()
  formData.append(
    "payload",
    JSON.stringify({
      ...input,
      existingImages: files.existingImages,
    })
  )

  for (const file of files.newFiles) {
    formData.append("files", file)
  }

  return formData
}

export function resolvePropertyListingMediaUrl(url: string): string {
  if (url.startsWith("http") || url.startsWith("blob:")) {
    return url
  }
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:8000"
  return `${base}${url.startsWith("/") ? url : `/${url}`}`
}
