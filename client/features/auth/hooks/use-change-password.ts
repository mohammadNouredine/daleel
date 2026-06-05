"use client"

import { usePostData } from "@/lib/api/services/use-post-data"
import { setAuthToken } from "@/lib/api/auth-token"
import { AUTH_CHANGE_PASSWORD } from "../endpoints"
import type { ChangePasswordBody, ChangePasswordResponse } from "../types"

export function useChangePassword(options?: { onSuccess?: () => void }) {
  return usePostData<ChangePasswordBody, ChangePasswordResponse>({
    endpoint: AUTH_CHANGE_PASSWORD,
    showSuccessToast: true,
    callBackOnSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token)
      }
      options?.onSuccess?.()
    },
  })
}
