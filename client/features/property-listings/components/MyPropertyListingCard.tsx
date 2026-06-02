"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PropertyListing } from "../types"
import {
  formatListingLocation,
  formatListingPriceLabel,
} from "../utils/property-listing-display"
import {
  formatPropertyListingStatus,
  propertyListingStatusBadgeClass,
} from "../utils/property-listing-status"
import { PropertyListingCover } from "./PropertyListingCover"

type MyPropertyListingCardProps = {
  listing: PropertyListing
  onEdit: (listing: PropertyListing) => void
}

export function MyPropertyListingCard({
  listing,
  onEdit,
}: MyPropertyListingCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Link
        href={`/properties/${listing._id}`}
        className="group relative block"
      >
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
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/properties/${listing._id}`} className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-semibold leading-snug hover:underline">
              {listing.title}
            </h3>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2"
            onClick={() => onEdit(listing)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatListingLocation(listing)}
        </p>
        <p className="mt-2 text-sm font-medium text-primary">
          {formatListingPriceLabel(listing)}
        </p>

        {listing.rejectionReason ? (
          <p className="mt-2 text-xs text-destructive">
            {listing.rejectionReason}
          </p>
        ) : null}
      </div>
    </article>
  )
}
