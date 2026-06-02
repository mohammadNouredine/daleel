"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InfiniteScrollSentinel } from "@/components/data/InfiniteScrollSentinel"
import { useInfiniteScrollTrigger } from "@/lib/hooks/use-infinite-scroll-trigger"
import { useAuthState } from "@/features/auth/hooks/use-is-authenticated"
import { HomeFooter } from "@/features/home/components/HomeFooter"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import { SectionHeader } from "@/features/home/components/SectionHeader"
import { useMyPropertyListingsInfinite } from "../hooks/use-my-property-listings-infinite"
import type { PropertyListing } from "../types"
import { CreatePropertyListingDialog } from "./CreatePropertyListingDialog"
import { MyPropertyListingCard } from "./MyPropertyListingCard"
import { PropertyListingCardSkeleton } from "./PropertyListingCardSkeleton"

export function MyPropertyListingsView() {
  const router = useRouter()
  const { isAuthenticated, isReady: isAuthReady } = useAuthState()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(
    null
  )

  const query = useMyPropertyListingsInfinite({
    enabled: isAuthenticated,
  })

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  )

  const { sentinelRef } = useInfiniteScrollTrigger({
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    enabled: isAuthenticated && !query.isLoading && !query.isError,
  })

  useEffect(() => {
    if (!isAuthReady) {
      return
    }
    if (!isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthReady, isAuthenticated, router])

  const openCreate = () => {
    setEditingListing(null)
    setCreateOpen(true)
  }

  const openEdit = (listing: PropertyListing) => {
    setEditingListing(listing)
    setCreateOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      setEditingListing(null)
    }
  }

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <HomeHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <PropertyListingCardSkeleton count={3} />
        </main>
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/properties"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 inline-flex gap-1.5"
          )}
        >
          <ArrowLeft className="size-4" />
          Back to browse
        </Link>

        <SectionHeader
          title="My property listings"
          subtitle="Manage drafts, pending, and published listings you created."
        />

        <div className="mt-6 flex justify-end">
          <Button type="button" className="gap-1.5" onClick={openCreate}>
            <Plus className="size-4" />
            Add property
          </Button>
        </div>

        <div className="mt-8">
          {query.isLoading ? (
            <PropertyListingCardSkeleton />
          ) : query.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">
                Could not load your listings.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => query.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
              <p className="text-sm font-medium">You have no listings yet</p>
              <Button
                type="button"
                className="mt-4 gap-1.5"
                onClick={openCreate}
              >
                <Plus className="size-4" />
                Add your first property
              </Button>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((listing) => (
                  <li key={listing._id}>
                    <MyPropertyListingCard
                      listing={listing}
                      onEdit={openEdit}
                    />
                  </li>
                ))}
              </ul>
              <InfiniteScrollSentinel
                sentinelRef={sentinelRef}
                isFetchingNextPage={query.isFetchingNextPage}
                hasNextPage={query.hasNextPage ?? false}
                isError={query.isFetchNextPageError}
                onRetry={() => query.fetchNextPage()}
              />
            </>
          )}
        </div>
      </main>
      <HomeFooter />

      <CreatePropertyListingDialog
        open={createOpen}
        onOpenChange={handleDialogOpenChange}
        editingListing={editingListing}
      />
    </div>
  )
}
