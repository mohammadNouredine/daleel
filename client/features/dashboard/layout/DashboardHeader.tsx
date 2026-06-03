"use client"

import { DashboardBreadcrumbs } from "./DashboardBreadcrumbs"
import { DashboardMobileNav } from "./DashboardMobileNav"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <DashboardMobileNav />
      <div className="min-w-0 flex-1">
        <DashboardBreadcrumbs />
      </div>
    </header>
  )
}
