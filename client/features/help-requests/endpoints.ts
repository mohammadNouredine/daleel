const HELP_REQUESTS_BASE = "/api/v1/help-requests"

export const HELP_REQUESTS_LIST = HELP_REQUESTS_BASE
export const HELP_REQUESTS_MINE = `${HELP_REQUESTS_BASE}/mine`
export const HELP_REQUESTS_PENDING = `${HELP_REQUESTS_BASE}/moderation/pending`
export const HELP_REQUESTS_CREATE = HELP_REQUESTS_BASE
export const HELP_REQUESTS_DETAIL = `${HELP_REQUESTS_BASE}/:id`
export const HELP_REQUESTS_UPDATE = `${HELP_REQUESTS_BASE}/:id`
export const HELP_REQUESTS_DELETE = `${HELP_REQUESTS_BASE}/:id`
export const HELP_REQUESTS_FULFILLMENT = `${HELP_REQUESTS_BASE}/:id/needs/:lineId/fulfillment`
export const HELP_REQUESTS_APPROVE = `${HELP_REQUESTS_BASE}/:id/approve`
export const HELP_REQUESTS_REJECT = `${HELP_REQUESTS_BASE}/:id/reject`

export const HELP_REQUESTS_QUERY_KEY = ["help-requests"] as const
export const MY_HELP_REQUESTS_QUERY_KEY = ["help-requests", "mine"] as const
export const PENDING_HELP_REQUESTS_QUERY_KEY = [
  "help-requests",
  "moderation",
  "pending",
] as const

export function helpRequestDetailEndpoint(id: string): string {
  return `${HELP_REQUESTS_BASE}/${id}`
}

export function helpRequestUpdateEndpoint(id: string): string {
  return `${HELP_REQUESTS_BASE}/${id}`
}

export function helpRequestDeleteEndpoint(id: string): string {
  return `${HELP_REQUESTS_BASE}/${id}`
}

export function helpRequestFulfillmentEndpoint(
  id: string,
  lineId: string
): string {
  return `${HELP_REQUESTS_BASE}/${id}/needs/${lineId}/fulfillment`
}

export function helpRequestApproveEndpoint(id: string): string {
  return `${HELP_REQUESTS_BASE}/${id}/approve`
}

export function helpRequestRejectEndpoint(id: string): string {
  return `${HELP_REQUESTS_BASE}/${id}/reject`
}
