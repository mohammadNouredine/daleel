const USERS_BASE = "/api/v1/users"
const UPLOADS_BASE = "/api/v1/uploads"

export const USERS_ME = `${USERS_BASE}/me`
export const USERS_LIST = USERS_BASE
export const UPLOAD_PROFILE_IMAGE = `${UPLOADS_BASE}/profile-image`

export const userDetail = (id: string) => `${USERS_BASE}/${id}`
export const userPermissions = (id: string) => `${USERS_BASE}/${id}/permissions`

export const CURRENT_PROFILE_QUERY_KEY = ["users", "me"] as const
export const USERS_LIST_QUERY_KEY = ["users", "list"] as const

export type ProfileImageUploadResponse = {
  url: string
}
