"use client"

import Link from "next/link"
import { ChevronDown, MapPin, Plus } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DaleelLogo } from "./daleel-logo"

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#housing-listings", label: "Housing" },
  { href: "/help-requests", label: "Help Requests" },
] as const

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <DaleelLogo showTagline={false} className="shrink-0" />

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted sm:inline-flex"
            aria-label="Selected region: Lebanon"
          >
            <MapPin className="size-3.5 shrink-0" />
            Lebanon
            <ChevronDown className="size-3.5 opacity-60" />
          </button>

          <Link
            href="/auth"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex"
            )}
          >
            Sign In
          </Link>

          <Link
            href="/help-requests"
            className={cn(buttonVariants({ size: "sm" }), "gap-1")}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Request</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
