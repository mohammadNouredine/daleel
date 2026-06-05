"use client"

import { usePostData } from "@/lib/api/services/use-post-data"
import { AUTH_RESEND_OTP } from "../endpoints"
import type { OtpMessageResponse } from "../types"

type ResendOtpBody = {
  email: string
}

export function useResendOtp() {
  return usePostData<ResendOtpBody, OtpMessageResponse>({
    endpoint: AUTH_RESEND_OTP,
    showSuccessToast: false,
    showErrorToast: false,
  })
}
