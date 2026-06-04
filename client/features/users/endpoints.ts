const USERS_BASE = "/api/v1/users"

export const USERS_ME = `${USERS_BASE}/me`
export const USERS_LIST = USERS_BASE

export const userDetail = (id: string) => `${USERS_BASE}/${id}`
export const userPermissions = (id: string) => `${USERS_BASE}/${id}/permissions`

export const CURRENT_PROFILE_QUERY_KEY = ["users", "me"] as const
export const USERS_LIST_QUERY_KEY = ["users", "list"] as const
