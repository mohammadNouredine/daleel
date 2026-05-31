"use client"

import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/api/auth-token"

/** Reads sessionStorage after mount so SSR and the first client render stay in sync. */
export function useIsAuthenticated(): boolean {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken())
  }, [])

  return isAuthenticated
}
