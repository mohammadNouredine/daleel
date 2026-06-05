"use client"

import { useRouter } from "next/navigation"
import { usePostData } from "@/lib/api/services/use-post-data"
import { AUTH_RESET_PASSWORD } from "../endpoints"
import type { PasswordStatusResponse, ResetPasswordBody } from "../types"

export function useResetPassword() {
  const router = useRouter()

  return usePostData<ResetPasswordBody, PasswordStatusResponse>({
    endpoint: AUTH_RESET_PASSWORD,
    showSuccessToast: true,
    callBackOnSuccess: () => {
      router.push("/auth")
    },
  })
}
