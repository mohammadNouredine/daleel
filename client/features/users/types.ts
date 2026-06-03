export type RequestPermissions = {
  read: boolean
  write: boolean
  edit: boolean
  verify: boolean
  manage: boolean
  delete: boolean
}

export type PropertyPermissions = {
  canViewProperties: boolean
  canEditProperty: boolean
  canDeleteProperty: boolean
  canHideProperty: boolean
  canApproveProperty: boolean
  canRejectProperty: boolean
}

export type PropertyPermissionKey = keyof PropertyPermissions

export type UserPermissions = {
  requests: RequestPermissions
  properties: PropertyPermissions
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
