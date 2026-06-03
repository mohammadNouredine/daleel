"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment, useMemo } from "react"
import { dashboardSegmentLabels } from "../navigation/dashboard-navigation"

function formatSegment(segment: string): string {
  return (
    dashboardSegmentLabels[segment] ??
    segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  )
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()

  const crumbs = useMemo(() => {
    if (!pathname.startsWith("/dashboard")) {
      return []
    }

    const segments = pathname.split("/").filter(Boolean)
    const items: { href: string; label: string }[] = []

    let path = ""
    for (const segment of segments) {
      path += `/${segment}`
      items.push({
        href: path,
        label: formatSegment(segment),
      })
    }

    return items
  }, [pathname])

  if (!crumbs.length) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={crumb.href}>
              {index > 0 ? <span aria-hidden>/</span> : null}
              <li className="min-w-0">
                {isLast ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
