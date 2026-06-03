"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, LayoutDashboard, LogOut, MapPin } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAuthState } from "@/features/auth/hooks/use-is-authenticated"
import { clearAuthToken } from "@/lib/api/auth-token"
import { cn } from "@/lib/utils"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import { DaleelLogo } from "./DaleelLogo"

export function HomeHeader() {
  const router = useRouter()
  const { isAuthenticated, isReady: isAuthReady } = useAuthState()
  const { data: profile } = useCurrentProfile()

  const handleSignOut = () => {
    clearAuthToken()
    router.push("/auth")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <DaleelLogo showTagline={false} className="shrink-0" />

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/help-requests"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Help Requests
          </Link>

          <div className="group relative">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Housing
              <ChevronDown className="size-3.5 opacity-70" />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 mt-2 w-44 rounded-lg border border-border bg-popover p-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <Link
                href="/properties"
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Browse properties
              </Link>
              <Link
                href="/properties/mine"
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                My listings
              </Link>
            </div>
          </div>
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

          <div className="group relative">
            <button
              type="button"
              className={cn(
                buttonVariants({ size: "sm" }),
                "inline-flex items-center gap-1"
              )}
            >
              Take action
              <ChevronDown className="size-3.5 opacity-80" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-border bg-popover p-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <Link
                href={isAuthenticated ? "/help-requests" : "/auth"}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Create help request
              </Link>
              <Link
                href={isAuthenticated ? "/properties/mine" : "/auth"}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Add a property
              </Link>
            </div>
          </div>

          {isAuthReady && isAuthenticated ? (
            <div className="group relative hidden sm:block">
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "inline-flex items-center gap-1"
                )}
              >
                {profile?.fullName ?? "Account"}
                <ChevronDown className="size-3.5 opacity-70" />
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-2 w-44 rounded-lg border border-border bg-popover p-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {profile?.role === "ADMIN" || profile?.role === "ORGANIZATION" ? (
                  <Link
                    href="/dashboard"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LayoutDashboard className="size-3.5" />
                    Dashboard
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex"
              )}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
