"use client"

import { Menu } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useDashboardAuth } from "../providers/DashboardAuthProvider"
import { dashboardNavigation } from "../navigation/dashboard-navigation"
import { filterDashboardNavigation } from "../navigation/filter-dashboard-nav"
import { DashboardSidebarNav } from "./DashboardSidebarNav"

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false)
  const { profile } = useDashboardAuth()
  const navItems = useMemo(
    () => filterDashboardNavigation(dashboardNavigation, profile),
    [profile]
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden"
        aria-label="Open dashboard menu"
        render={
          <Button type="button" variant="outline" size="icon" />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,18rem)] p-0">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle>Dashboard</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-3 py-4">
          <DashboardSidebarNav
            items={navItems}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
