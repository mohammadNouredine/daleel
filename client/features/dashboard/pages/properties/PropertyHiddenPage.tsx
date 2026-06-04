"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { useConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { useHiddenPropertyListings } from "@/features/property-listings/hooks/use-hidden-property-listings"
import { usePermanentDeletePropertyListing } from "@/features/property-listings/hooks/use-permanent-delete-property-listing"
import { PropertyListingStatus } from "@/features/property-listings/types"
import { PropertyListingCover } from "@/features/property-listings/components/PropertyListingCover"
import { formatListingLocation, formatListingPriceLabel } from "@/features/property-listings/utils/property-listing-display"
import {
  formatPropertyListingStatus,
  propertyListingStatusBadgeClass,
} from "@/features/property-listings/utils/property-listing-status"
import { cn } from "@/lib/utils"
import { canViewHiddenProperties } from "@/lib/access-control"
import { useDashboardAuth } from "../../providers/DashboardAuthProvider"
import { DashboardPageHeader } from "../../components/DashboardPageHeader"

export function PropertyHiddenPage() {
  const { profile } = useDashboardAuth()
  const canView = canViewHiddenProperties(profile)
  const { confirmAsync } = useConfirmDialog()
  const permanentDeleteMutation = usePermanentDeletePropertyListing()
  const { data: listings = [], isLoading } = useHiddenPropertyListings(canView)

  const handlePermanentDelete = async (listingId: string) => {
    const confirmed = await confirmAsync({
      title: "Permanently delete this listing?",
      description:
        "This cannot be undone. All images and data will be removed from the platform.",
      confirmText: "Delete permanently",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (!confirmed) return
    permanentDeleteMutation.mutate(listingId)
  }

  if (!canView) {
    return (
      <>
        <DashboardPageHeader
          title="Hidden & deleted"
          description="Listings removed from public view or soft-deleted by owners."
        />
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
          You do not have access to this view.
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardPageHeader
        title="Hidden & deleted"
        description="Listings hidden by owners or soft-deleted. Permanently removed after the retention period."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading listings…</p>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-muted-foreground">
          No hidden or deleted listings.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <li
              key={listing._id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="relative">
                <PropertyListingCover
                  listing={listing}
                  className="aspect-[4/3] w-full"
                />
                <Badge
                  className={cn(
                    "absolute left-3 top-3 border-0 shadow-sm",
                    propertyListingStatusBadgeClass(listing.status)
                  )}
                >
                  {formatPropertyListingStatus(listing.status)}
                </Badge>
              </div>
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 font-semibold leading-snug">
                  {listing.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatListingLocation(listing)}
                </p>
                <p className="text-sm font-medium text-primary">
                  {formatListingPriceLabel(listing)}
                </p>
                {listing.status === PropertyListingStatus.ARCHIVED &&
                listing.archivedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Hidden {new Date(listing.archivedAt).toLocaleDateString()}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={`/dashboard/properties/${listing._id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Dashboard view
                  </Link>
                  <Link
                    href={`/properties/${listing._id}`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Public view
                  </Link>
                  {listing.status === PropertyListingStatus.DELETED ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={permanentDeleteMutation.isPending}
                      onClick={() => void handlePermanentDelete(listing._id)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete permanently
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
