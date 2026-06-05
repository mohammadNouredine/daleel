"use client"

import { usePostData } from "@/lib/api/services/use-post-data"
import { AUTH_REQUEST_PASSWORD_RESET } from "../endpoints"
import type {
  PasswordStatusResponse,
  RequestPasswordResetBody,
} from "../types"

export function useRequestPasswordReset() {
  return usePostData<RequestPasswordResetBody, PasswordStatusResponse>({
    endpoint: AUTH_REQUEST_PASSWORD_RESET,
    showSuccessToast: true,
  })
}
