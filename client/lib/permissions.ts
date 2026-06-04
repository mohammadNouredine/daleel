import type {
  PropertyPermissionKey,
  RequestPermissions,
  UserAdminPermissionKey,
  UserPermissions,
} from "@/features/users/types"

export function hasRequestPermission(
  permissions: UserPermissions | undefined,
  action: keyof RequestPermissions
): boolean {
  return permissions?.requests?.[action] === true
}

export function canWriteHelpRequests(
  permissions: UserPermissions | undefined
): boolean {
  return hasRequestPermission(permissions, "write")
}

export function canEditHelpRequests(
  permissions: UserPermissions | undefined
): boolean {
  return hasRequestPermission(permissions, "edit")
}

export function canDeleteHelpRequests(
  permissions: UserPermissions | undefined
): boolean {
  return hasRequestPermission(permissions, "delete")
}

export function canManageHelpRequests(
  permissions: UserPermissions | undefined
): boolean {
  return hasRequestPermission(permissions, "manage")
}

export function hasPropertyPermission(
  permissions: UserPermissions | undefined,
  action: PropertyPermissionKey
): boolean {
  return permissions?.properties?.[action] === true
}

export function canViewProperties(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canViewProperties")
}

export function canEditProperty(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canEditProperty")
}

export function canDeleteProperty(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canDeleteProperty")
}

export function canHideProperty(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canHideProperty")
}

export function canApproveProperty(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canApproveProperty")
}

export function canRejectProperty(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canRejectProperty")
}

export function canPermanentlyDeleteProperty(
  permissions: UserPermissions | undefined
): boolean {
  return hasPropertyPermission(permissions, "canPermanentlyDeleteProperty")
}

export function hasUserAdminPermission(
  permissions: UserPermissions | undefined,
  action: UserAdminPermissionKey
): boolean {
  return permissions?.users?.[action] === true
}

export function canReadUsers(
  permissions: UserPermissions | undefined
): boolean {
  return hasUserAdminPermission(permissions, "read")
}

export function canEditUsers(
  permissions: UserPermissions | undefined
): boolean {
  return hasUserAdminPermission(permissions, "edit")
}

export function canDeleteUsers(
  permissions: UserPermissions | undefined
): boolean {
  return hasUserAdminPermission(permissions, "delete")
}

export function canManageUserPermissions(
  permissions: UserPermissions | undefined
): boolean {
  return hasUserAdminPermission(permissions, "managePermissions")
}
