"use client"

import Link from "next/link"
import { useMemo } from "react"
import { DaleelLogo } from "@/features/home/components/DaleelLogo"
import { cn } from "@/lib/utils"
import { useDashboardAuth } from "../providers/DashboardAuthProvider"
import { dashboardNavigation } from "../navigation/dashboard-navigation"
import { filterDashboardNavigation } from "../navigation/filter-dashboard-nav"
import { DashboardSidebarNav } from "./DashboardSidebarNav"

type DashboardSidebarProps = {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const { profile } = useDashboardAuth()
  const navItems = useMemo(
    () => filterDashboardNavigation(dashboardNavigation, profile),
    [profile]
  )

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card/40",
        className
      )}
    >
      <div className="border-b border-border px-4 py-4">
        <Link href="/dashboard" className="inline-flex">
          <DaleelLogo showTagline={false} />
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">Management dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <DashboardSidebarNav items={navItems} />
      </div>

      <div className="space-y-2 border-t border-border px-4 py-4">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="truncate text-sm font-medium">{profile.fullName}</p>
          <p className="text-xs text-muted-foreground">{profile.role}</p>
        </div>
        <Link
          href="/"
          className="block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to public site
        </Link>
      </div>
    </aside>
  )
}
