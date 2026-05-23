export type RequestPermissions = {
  read: boolean
  write: boolean
  edit: boolean
  verify: boolean
  manage: boolean
}

export type UserPermissions = {
  requests: RequestPermissions
}

export type DaleelProfile = {
  _id: string
  fullName: string
  email?: string
  role: "USER" | "VOLUNTEER" | "ORGANIZATION" | "ADMIN"
  permissions: UserPermissions
  isVerified: boolean
  isActive: boolean
}
