import {
  Building2,
  FolderTree,
  HandHeart,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react"
import type { DashboardNavItem } from "./dashboard-nav.types"

export const DASHBOARD_ALLOWED_ROLES = ["ADMIN", "ORGANIZATION"] as const

export const dashboardNavigation: DashboardNavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    icon: Users,
    access: { roles: ["ADMIN", "ORGANIZATION"] },
    children: [
      {
        label: "All users",
        href: "/dashboard/users",
      },
    ],
  },
  {
    label: "Properties",
    icon: Building2,
    access: { roles: ["ADMIN", "ORGANIZATION"] },
    children: [
      {
        label: "All listings",
        href: "/dashboard/properties",
      },
      {
        label: "Approvals",
        href: "/dashboard/properties/approvals",
        access: { roles: ["ADMIN"] },
      },
      {
        label: "Hidden & deleted",
        href: "/dashboard/properties/hidden",
        access: { roles: ["ADMIN"] },
      },
      {
        label: "Categories",
        href: "/dashboard/properties/categories",
      },
    ],
  },
  {
    label: "Help requests",
    icon: HandHeart,
    access: { roles: ["ADMIN", "ORGANIZATION"] },
    children: [
      {
        label: "Pending approval",
        href: "/dashboard/help-requests/pending",
        access: { roles: ["ADMIN"] },
      },
      {
        label: "Open",
        href: "/dashboard/help-requests/open",
      },
      {
        label: "Closed",
        href: "/dashboard/help-requests/closed",
      },
    ],
  },
]

export const dashboardSegmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  properties: "Properties",
  all: "All listings",
  approvals: "Approvals",
  hidden: "Hidden & deleted",
  categories: "Categories",
  "help-requests": "Help requests",
  pending: "Pending approval",
  open: "Open",
  closed: "Closed",
}
