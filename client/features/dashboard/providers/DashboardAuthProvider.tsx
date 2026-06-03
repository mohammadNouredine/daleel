"use client"

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAuthState } from "@/features/auth/hooks/use-is-authenticated"
import { useCurrentProfile } from "@/features/users/hooks/use-current-profile"
import { DASHBOARD_ALLOWED_ROLES } from "../navigation/dashboard-navigation"
import type { DashboardAuthContextValue } from "../navigation/dashboard-nav.types"

const DashboardAuthContext = createContext<DashboardAuthContextValue | null>(
  null
)

export function useDashboardAuth(): DashboardAuthContextValue {
  const value = useContext(DashboardAuthContext)
  if (!value) {
    throw new Error("useDashboardAuth must be used within DashboardAuthProvider")
  }
  return value
}

function DashboardAuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    </div>
  )
}

type DashboardAuthProviderProps = {
  children: ReactNode
}

export function DashboardAuthProvider({ children }: DashboardAuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isReady: isAuthReady } = useAuthState()
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile()

  const isAllowedRole =
    profile?.role != null &&
    (DASHBOARD_ALLOWED_ROLES as readonly string[]).includes(profile.role)

  useEffect(() => {
    if (!isAuthReady) return
    if (!isAuthenticated) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthReady, isAuthenticated, pathname, router])

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || isProfileLoading) return
    if (profile && !isAllowedRole) {
      toast.error("You do not have access to the dashboard")
      router.replace("/")
    }
  }, [
    isAuthReady,
    isAuthenticated,
    isProfileLoading,
    isAllowedRole,
    profile,
    router,
  ])

  if (!isAuthReady) {
    return <DashboardAuthLoading />
  }

  if (!isAuthenticated) {
    return <DashboardAuthLoading />
  }

  if (isProfileLoading || !profile) {
    return <DashboardAuthLoading />
  }

  if (!isAllowedRole) {
    return null
  }

  const value: DashboardAuthContextValue = {
    profile,
    isAdmin: profile.role === "ADMIN",
    isOrganization: profile.role === "ORGANIZATION",
  }

  return (
    <DashboardAuthContext.Provider value={value}>
      {children}
    </DashboardAuthContext.Provider>
  )
}
