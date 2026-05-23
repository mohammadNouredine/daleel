import { ApiError, apiFetch, resolveUrl } from "./client"
import { getAuthToken } from "./auth-token"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type ApiSuccessResult<TData> = {
  data: TData
  message: string
  token: string | null
}

type SendToApiOptions = {
  skipAuth?: boolean
  successMessage?: string
}

function extractToken(
  response: Response,
  body: Record<string, unknown> | undefined
): string | null {
  const headerToken = response.headers.get("set-auth-token")
  const bodyToken =
    body && typeof body.token === "string" ? body.token : null
  return headerToken ?? bodyToken ?? null
}

function extractSuccessMessage(
  body: Record<string, unknown> | undefined,
  fallback: string
): string {
  if (!body) return fallback
  if (typeof body.message === "string") return body.message
  return fallback
}

export async function sendToApi<TBody, TData>(
  endpoint: string,
  data: TBody,
  method: HttpMethod = "POST",
  options: SendToApiOptions = {}
): Promise<ApiSuccessResult<TData>> {
  const { skipAuth = false, successMessage = "" } = options

  if (method === "GET") {
    const result = await apiFetch<TData>(endpoint, { skipAuth })
    return {
      data: result,
      message: successMessage,
      token: null,
    }
  }

  const headers = new Headers({ "Content-Type": "application/json" })

  if (!skipAuth) {
    const token = getAuthToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(resolveUrl(endpoint), {
    method,
    headers,
    body: JSON.stringify(data),
    credentials: "include",
  })

  let parsed: Record<string, unknown> | undefined
  try {
    parsed = (await response.json()) as Record<string, unknown>
  } catch {
    parsed = undefined
  }

  if (!response.ok) {
    const record = parsed
    let message = response.statusText
    if (record) {
      const msg = record.message
      if (typeof msg === "string") message = msg
      else if (Array.isArray(msg)) message = msg.join(", ")
    }
    throw new ApiError(message, response.status, parsed)
  }

  const token = extractToken(response, parsed)
  const message = extractSuccessMessage(parsed, successMessage)

  const responseData = (
    parsed
      ? { ...parsed, ...(token ? { token } : {}) }
      : {}
  ) as TData

  return {
    data: responseData,
    message,
    token,
  }
}
