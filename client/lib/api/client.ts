const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000"

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

/** Resolves a user-facing message from varied API / Better Auth error payloads. */
export function extractApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong"
): string {
  if (!data || typeof data !== "object") {
    return fallback
  }

  const record = data as Record<string, unknown>

  if (isNonEmptyString(record.message)) {
    return record.message.trim()
  }

  if (isNonEmptyString(record.error)) {
    return record.error.trim()
  }

  const nested = record.data
  if (nested && typeof nested === "object") {
    const nestedRecord = nested as Record<string, unknown>

    if (isNonEmptyString(nestedRecord.message)) {
      return nestedRecord.message.trim()
    }

    const body = nestedRecord.body
    if (body && typeof body === "object") {
      const bodyRecord = body as Record<string, unknown>
      if (isNonEmptyString(bodyRecord.message)) {
        return bodyRecord.message.trim()
      }
    }
  }

  return fallback
}

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

export function resolveUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE}${path}`
}
