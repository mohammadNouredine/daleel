"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { DashboardNavItem } from "../navigation/dashboard-nav.types"

function isNavItemActive(pathname: string, href?: string): boolean {
  if (!href) return false
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function hasActiveChild(pathname: string, item: DashboardNavItem): boolean {
  if (item.href && isNavItemActive(pathname, item.href)) {
    return true
  }
  return item.children?.some((child) => hasActiveChild(pathname, child)) ?? false
}

type NavBranchProps = {
  item: DashboardNavItem
  pathname: string
  depth?: number
  onNavigate?: () => void
}

function NavBranch({ item, pathname, depth = 0, onNavigate }: NavBranchProps) {
  const [open, setOpen] = useState(() => hasActiveChild(pathname, item))
  const hasChildren = Boolean(item.children?.length)
  const Icon = item.icon
  const active = item.href ? isNavItemActive(pathname, item.href) : false
  const childActive = hasActiveChild(pathname, item)

  if (!hasChildren && item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          depth > 0 && "pl-8",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        <span className="truncate">{item.label}</span>
      </Link>
    )
  }

  return (
    <div className={cn(depth > 0 && "pl-2")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
          childActive
            ? "bg-muted/80 text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && item.children ? (
        <div className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <NavBranch
              key={child.href ?? child.label}
              item={child}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

type DashboardSidebarNavProps = {
  items: DashboardNavItem[]
  onNavigate?: () => void
  className?: string
}

export function DashboardSidebarNav({
  items,
  onNavigate,
  className,
}: DashboardSidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("flex flex-col gap-0.5", className)}
      aria-label="Dashboard"
    >
      {items.map((item) => (
        <NavBranch
          key={item.label}
          item={item}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
