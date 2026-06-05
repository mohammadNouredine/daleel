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
  canPermanentlyDeleteProperty: boolean
}

export type PropertyPermissionKey = keyof PropertyPermissions

export type UserAdminPermissions = {
  read: boolean
  edit: boolean
  delete: boolean
  managePermissions: boolean
}

export type UserAdminPermissionKey = keyof UserAdminPermissions

export type UserPermissions = {
  requests: RequestPermissions
  properties: PropertyPermissions
  users: UserAdminPermissions
}

export type AdminUser = {
  _id: string
  fullName: string
  email: string
  role: DaleelProfile["role"]
  permissions: UserPermissions
  isVerified: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type UsersListResponse = {
  items: AdminUser[]
  nextLastId: string | null
}

export type UpdateUserInput = {
  fullName?: string
  role?: DaleelProfile["role"]
  isActive?: boolean
  isVerified?: boolean
}

export type DaleelProfile = {
  _id: string
  fullName: string
  email?: string
  role: "USER" | "VOLUNTEER" | "ORGANIZATION" | "ADMIN"
  permissions: UserPermissions
  phoneNumber?: string | null
  whatsappNumber?: string | null
  profileImage?: string | null
  isVerified: boolean
  isActive: boolean
}

export type UpdateMyProfileInput = {
  fullName?: string
  phoneNumber?: string | null
  whatsappNumber?: string | null
  profileImage?: string | null
}

export type UsersMeResponse = {
  profile: DaleelProfile
}
