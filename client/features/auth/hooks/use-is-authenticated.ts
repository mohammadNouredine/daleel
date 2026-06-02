"use client"

import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/api/auth-token"

export type AuthState = {
  isAuthenticated: boolean
  /** False until the client has read sessionStorage (avoids false redirects on mount). */
  isReady: boolean
}

function readAuthState(): AuthState {
  return {
    isAuthenticated: !!getAuthToken(),
    isReady: typeof window !== "undefined",
  }
}

/** Reads sessionStorage after mount so SSR and the first client render stay in sync. */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isReady: false,
  })

  useEffect(() => {
    setState(readAuthState())
  }, [])

  return state
}

export function useIsAuthenticated(): boolean {
  return useAuthState().isAuthenticated
}
