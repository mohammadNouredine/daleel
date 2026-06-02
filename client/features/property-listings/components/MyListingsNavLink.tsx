"use client"

import Link from "next/link"
import { useIsAuthenticated } from "@/features/auth/hooks/use-is-authenticated"
import { useMyPropertyListingsCount } from "../hooks/use-my-property-listings-count"

type MyListingsNavLinkProps = {
  className?: string
}

export function MyListingsNavLink({ className }: MyListingsNavLinkProps) {
  const isAuthenticated = useIsAuthenticated()
  const { hasListings, isLoading } = useMyPropertyListingsCount(isAuthenticated)

  if (!isAuthenticated || isLoading || !hasListings) {
    return null
  }

  return (
    <Link href="/properties/mine" className={className}>
      My listings
    </Link>
  )
}
