import { getAuthToken } from "./auth-token"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean
}

function resolveUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE}${path}`
}

function parseErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback

  const record = data as Record<string, unknown>
  const message = record.message

  if (typeof message === "string") return message
  if (Array.isArray(message)) return message.join(", ")

  return fallback
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuth, headers: customHeaders, ...rest } = options
  const headers = new Headers(customHeaders)

  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (!skipAuth) {
    const token = getAuthToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers,
    credentials: "include",
  })

  if (!response.ok) {
    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = undefined
    }
    throw new ApiError(
      parseErrorMessage(data, response.statusText),
      response.status,
      data
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body: TBody,
  options: { skipAuth?: boolean } = {}
): Promise<{ data: TResponse; token: string | null }> {
  const { skipAuth } = options
  const headers = new Headers({ "Content-Type": "application/json" })

  if (!skipAuth) {
    const token = getAuthToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(resolveUrl(path), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  })

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = undefined
  }

  if (!response.ok) {
    throw new ApiError(
      parseErrorMessage(data, response.statusText),
      response.status,
      data
    )
  }

  const headerToken = response.headers.get("set-auth-token")
  const bodyToken =
    data && typeof data === "object" && "token" in data
      ? (data as { token?: string | null }).token ?? null
      : null

  return {
    data: data as TResponse,
    token: headerToken ?? bodyToken,
  }
}
