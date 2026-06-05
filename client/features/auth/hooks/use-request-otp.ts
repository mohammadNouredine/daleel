"use client"

import { usePostData } from "@/lib/api/services/use-post-data"
import { AUTH_REQUEST_OTP } from "../endpoints"
import type { OtpMessageResponse, SignUpBody } from "../types"

export function useRequestOtp() {
  return usePostData<SignUpBody, OtpMessageResponse>({
    endpoint: AUTH_REQUEST_OTP,
    showSuccessToast: false,
    showErrorToast: false,
  })
}
