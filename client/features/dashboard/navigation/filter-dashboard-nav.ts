import type { DaleelProfile } from "@/features/users/types"
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/lib/access-control"
import type { PermissionPath } from "@/lib/permission-catalog"
import type { DashboardNavAccess, DashboardNavItem } from "./dashboard-nav.types"

function matchesRoleAccess(
  access: DashboardNavAccess | undefined,
  profile: DaleelProfile
): boolean {
  if (!access?.roles?.length) {
    return true
  }
  return access.roles.includes(profile.role)
}

function matchesPermissionAccess(
  access: DashboardNavAccess | undefined,
  profile: DaleelProfile
): boolean {
  if (access?.allPermissions?.length) {
    if (!hasAllPermissions(profile, access.allPermissions as PermissionPath[])) {
      return false
    }
  }

  if (access?.anyPermissions?.length) {
    if (!hasAnyPermission(profile, access.anyPermissions as PermissionPath[])) {
      return false
    }
  }

  return true
}

function canAccessItem(
  access: DashboardNavAccess | undefined,
  profile: DaleelProfile
): boolean {
  if (!access) {
    return true
  }

  const roleOk = matchesRoleAccess(access, profile)
  const permissionOk = matchesPermissionAccess(access, profile)

  if (access.roles?.length && access.anyPermissions?.length) {
    return roleOk && permissionOk
  }

  if (access.roles?.length) {
    return roleOk
  }

  if (access.anyPermissions?.length || access.allPermissions?.length) {
    return permissionOk
  }

  return true
}

function filterNavItems(
  items: DashboardNavItem[],
  profile: DaleelProfile
): DashboardNavItem[] {
  return items
    .map((item) => {
      if (!canAccessItem(item.access, profile)) {
        return null
      }

      if (item.children?.length) {
        const children = filterNavItems(item.children, profile)
        if (!children.length) {
          return null
        }
        return { ...item, children }
      }

      return item
    })
    .filter((item): item is DashboardNavItem => item !== null)
}

export function filterDashboardNavigation(
  items: DashboardNavItem[],
  profile: DaleelProfile
): DashboardNavItem[] {
  return filterNavItems(items, profile)
}
