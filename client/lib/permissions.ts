import type {
  RequestPermissions,
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
