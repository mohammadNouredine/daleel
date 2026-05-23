"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiPost } from "@/lib/api/client"
import { setAuthToken } from "@/lib/api/auth-token"
import { AUTH_SIGN_IN } from "../endpoints"
import type { AuthResponse, SignInBody } from "../types"

export function useSignIn() {
  const router = useRouter()

  return useMutation({
    mutationFn: (body: SignInBody) =>
      apiPost<AuthResponse, SignInBody>(AUTH_SIGN_IN, body, { skipAuth: true }),
    onSuccess: ({ token }) => {
      if (token) setAuthToken(token)
      router.push("/")
    },
  })
}
