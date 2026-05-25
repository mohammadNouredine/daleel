"use client"

import { useRouter } from "next/navigation"
import { usePostData } from "@/lib/api/services/use-post-data"
import { setAuthToken } from "@/lib/api/auth-token"
import { AUTH_SIGN_UP } from "../endpoints"
import type { AuthResponse, SignUpBody } from "../types"

export function useSignUp() {
  const router = useRouter()

  return usePostData<SignUpBody, AuthResponse>({
    endpoint: AUTH_SIGN_UP,
    showSuccessToast: false,
    callBackOnSuccess: (data) => {
      if (data.token) setAuthToken(data.token)
      router.push("/")
    },
  })
}
