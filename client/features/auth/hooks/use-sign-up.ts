"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiPost } from "@/lib/api/client"
import { setAuthToken } from "@/lib/api/auth-token"
import { AUTH_SIGN_UP } from "../endpoints"
import type { AuthResponse, SignUpBody } from "../types"

export function useSignUp() {
  const router = useRouter()

  return useMutation({
    mutationFn: (body: SignUpBody) =>
      apiPost<AuthResponse, SignUpBody>(AUTH_SIGN_UP, body, { skipAuth: true }),
    onSuccess: ({ token }) => {
      if (token) setAuthToken(token)
      router.push("/")
    },
  })
}
