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
