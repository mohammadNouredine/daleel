"use client"

import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { useReadData } from "@/lib/api/services/use-read-data"
import { CreatePropertyListingDialog } from "@/features/property-listings/components/CreatePropertyListingDialog"
import { PropertyListingCover } from "@/features/property-listings/components/PropertyListingCover"
import { PropertyListingRowActions } from "@/features/property-listings/components/PropertyListingRowActions"
import {
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingDetailEndpoint,
} from "@/features/property-listings/endpoints"
import type { PropertyListing } from "@/features/property-listings/types"
import {
  formatListingLocation,
  formatListingPriceLabel,
} from "@/features/property-listings/utils/property-listing-display"
import {
  formatPropertyListingStatus,
  propertyListingStatusBadgeClass,
} from "@/features/property-listings/utils/property-listing-status"
import { canViewPropertiesFromProfile } from "@/features/property-listings/utils/property-permissions"
import { cn } from "@/lib/utils"
import { DashboardPageHeader } from "../../components/DashboardPageHeader"
import { useDashboardAuth } from "../../providers/DashboardAuthProvider"

type PropertyDetailPageProps = {
  listingId: string
}

export function PropertyDetailPage({ listingId }: PropertyDetailPageProps) {
  const { profile } = useDashboardAuth()
  const canView = canViewPropertiesFromProfile(profile)
  const [editOpen, setEditOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(
    null
  )

  const { data: listing, isLoading, isError } = useReadData<PropertyListing>({
    queryKey: [...PROPERTY_LISTINGS_QUERY_KEY, "detail", listingId],
    endpoint: propertyListingDetailEndpoint(listingId),
    enabled: canView && Boolean(listingId),
  })

  if (!canView) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
        You do not have permission to view this property.
      </div>
    )
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading property…</p>
    )
  }

  if (isError || !listing) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card/50 px-6 py-14 text-center text-sm text-muted-foreground">
        Property not found or unavailable.
      </div>
    )
  }

  return (
    <>
      <DashboardPageHeader
        title={listing.title}
        description={formatListingLocation(listing)}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PropertyListingRowActions
              listing={listing}
              profile={profile}
              onEdit={(item) => {
                setEditingListing(item)
                setEditOpen(true)
              }}
            />
            <Link
              href={`/properties/${listing._id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Public view
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <PropertyListingCover listing={listing} className="aspect-[4/3] w-full rounded-xl" />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "border-0",
                propertyListingStatusBadgeClass(listing.status)
              )}
            >
              {formatPropertyListingStatus(listing.status)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {listing.listingType} · {listing.propertyType}
            </span>
          </div>
          <p className="text-lg font-medium text-primary">
            {formatListingPriceLabel(listing)}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
          {listing.rejectionReason ? (
            <p className="text-sm text-destructive">{listing.rejectionReason}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Owner ID: {listing.ownerId}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {new Date(listing.updatedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <CreatePropertyListingDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) setEditingListing(null)
        }}
        editingListing={editingListing}
      />
    </>
  )
}
