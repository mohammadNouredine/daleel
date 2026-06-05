"use client"

import { usePostFormData } from "@/lib/api/services/use-post-form-data"
import {
  type ProfileImageUploadResponse,
  UPLOAD_PROFILE_IMAGE,
} from "../endpoints"

export function useUploadProfileImage(options?: {
  onSuccess?: (url: string) => void
}) {
  return usePostFormData<ProfileImageUploadResponse>({
    endpoint: UPLOAD_PROFILE_IMAGE,
    showSuccessToast: false,
    callBackOnSuccess: (data) => {
      options?.onSuccess?.(data.url)
    },
  })
}

export function buildProfileImageFormData(file: File): FormData {
  const formData = new FormData()
  formData.append("files", file)
  return formData
}
