const AUTH_TOKEN_KEY = "daleel_auth_token"

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}
