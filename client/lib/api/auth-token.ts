import { getQueryClient } from "@/lib/query-client"

const AUTH_TOKEN_KEY = "daleel_auth_token"

export const AUTH_SESSION_CHANGED_EVENT = "daleel:auth-session-changed"

function notifyAuthSessionChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

function resetAuthQueryCache(): void {
  getQueryClient().clear()
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  resetAuthQueryCache()
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
  notifyAuthSessionChanged()
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  resetAuthQueryCache()
  notifyAuthSessionChanged()
}
