import type {
  DaleelProfile,
  PropertyPermissions,
  RequestPermissions,
  UserAdminPermissions,
  UserPermissions,
} from "@/features/users/types"
import type { PermissionPath } from "./permission-catalog"
import {
  hasPropertyPermission,
  hasRequestPermission,
} from "./permissions"

export type AccessScope = "platform" | "own" | "none"

export type DashboardRole = DaleelProfile["role"]

function hasUserAdminPermission(
  permissions: UserPermissions | undefined,
  action: keyof UserAdminPermissions
): boolean {
  return permissions?.users?.[action] === true
}

export function hasPermission(
  profile: DaleelProfile,
  path: PermissionPath
): boolean {
  const permissions = profile.permissions
  const [group, key] = path.split(".") as [string, string]

  switch (group) {
    case "requests":
      return hasRequestPermission(
        permissions,
        key as keyof RequestPermissions
      )
    case "properties":
      return hasPropertyPermission(
        permissions,
        key as keyof PropertyPermissions
      )
    case "users":
      return hasUserAdminPermission(
        permissions,
        key as keyof UserAdminPermissions
      )
    default:
      return false
  }
}

export function canModerateProperties(profile: DaleelProfile): boolean {
  return (
    hasPermission(profile, "properties.canApproveProperty") ||
    hasPermission(profile, "properties.canRejectProperty")
  )
}

export function canModerateHelpRequests(profile: DaleelProfile): boolean {
  return hasPermission(profile, "requests.verify")
}

export function canViewHiddenProperties(profile: DaleelProfile): boolean {
  return (
    hasPermission(profile, "properties.canHideProperty") ||
    hasPermission(profile, "properties.canPermanentlyDeleteProperty")
  )
}

export function hasAnyPermission(
  profile: DaleelProfile,
  paths: PermissionPath[]
): boolean {
  return paths.some((path) => hasPermission(profile, path))
}

export function hasAllPermissions(
  profile: DaleelProfile,
  paths: PermissionPath[]
): boolean {
  return paths.every((path) => hasPermission(profile, path))
}
