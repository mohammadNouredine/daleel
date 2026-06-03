import type { DaleelProfile } from "@/features/users/types"
import type { DashboardNavAccess, DashboardNavItem } from "./dashboard-nav.types"

function canAccessItem(
  access: DashboardNavAccess | undefined,
  profile: DaleelProfile
): boolean {
  if (!access?.roles?.length) {
    return true
  }
  return access.roles.includes(profile.role)
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
