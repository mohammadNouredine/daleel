import type { LucideIcon } from "lucide-react"
import type { DaleelProfile } from "@/features/users/types"

export type DashboardRole = DaleelProfile["role"]

export type DashboardNavAccess = {
  roles?: DashboardRole[]
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
}
