import type { LucideIcon } from "lucide-react"
import type { DaleelProfile } from "@/features/users/types"
import type { PermissionPath } from "@/lib/permission-catalog"

export type DashboardRole = DaleelProfile["role"]

export type DashboardNavAccess = {
  roles?: DashboardRole[]
  anyPermissions?: PermissionPath[]
  allPermissions?: PermissionPath[]
}

export type DashboardNavItem = {
  label: string
  href?: string
  icon?: LucideIcon
  access?: DashboardNavAccess
  children?: DashboardNavItem[]
}

export type DashboardAuthContextValue = {
  profile: DaleelProfile
  isAdmin: boolean
  isOrganization: boolean
  hasPermission: (path: PermissionPath) => boolean
  hasAnyPermission: (paths: PermissionPath[]) => boolean
}
