"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useMemo } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePendingHelpRequests } from "@/features/help-requests/hooks/use-moderate-help-request"
import { usePendingPropertyListings } from "@/features/property-listings/hooks/use-pending-property-listings"
import { useDashboardAuth } from "../providers/DashboardAuthProvider"
import { dashboardNavigation } from "../navigation/dashboard-navigation"
import { filterDashboardNavigation } from "../navigation/filter-dashboard-nav"
import { DashboardPageHeader } from "../components/DashboardPageHeader"
import type { DashboardNavItem } from "../navigation/dashboard-nav.types"

function collectNavLinks(items: DashboardNavItem[]): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = []
  for (const item of items) {
    if (item.href) {
      links.push({ label: item.label, href: item.href })
    }
    if (item.children) {
      links.push(...collectNavLinks(item.children))
    }
  }
  return links
}

export function DashboardOverviewPage() {
  const { profile, isAdmin } = useDashboardAuth()
  const navLinks = useMemo(
    () =>
      collectNavLinks(filterDashboardNavigation(dashboardNavigation, profile)),
    [profile]
  )

  const { data: pendingHelp = [] } = usePendingHelpRequests(isAdmin)
  const { data: pendingProperties = [] } = usePendingPropertyListings(isAdmin)

  return (
    <>
      <DashboardPageHeader
        title="Overview"
        description={`Welcome back, ${profile.fullName}. Manage users, properties, and help requests from one place.`}
      />

      {isAdmin ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending help requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{pendingHelp.length}</p>
              <Link
                href="/dashboard/help-requests/pending"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "mt-2 inline-flex h-auto px-0"
                )}
              >
                Review queue
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending property approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{pendingProperties.length}</p>
              <Link
                href="/dashboard/properties/approvals"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "mt-2 inline-flex h-auto px-0"
                )}
              >
                Review queue
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {navLinks
          .filter((link) => link.href !== "/dashboard")
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-border/80 bg-card/60 p-4 transition-colors hover:bg-muted/50"
            >
              <p className="font-medium">{link.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{link.href}</p>
            </Link>
          ))}
      </div>
    </>
  )
}
