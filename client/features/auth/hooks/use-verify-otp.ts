"use client"

import { useRouter } from "next/navigation"
import { usePostData } from "@/lib/api/services/use-post-data"
import { setAuthToken } from "@/lib/api/auth-token"
import { AUTH_VERIFY_OTP } from "../endpoints"
import type { AuthResponse, VerifyOtpBody } from "../types"

export function useVerifyOtp() {
  const router = useRouter()

  return usePostData<VerifyOtpBody, AuthResponse>({
    endpoint: AUTH_VERIFY_OTP,
    showSuccessToast: false,
    showErrorToast: false,
    callBackOnSuccess: (data) => {
      if (data.token) setAuthToken(data.token)
      router.push("/")
    },
  })
}
