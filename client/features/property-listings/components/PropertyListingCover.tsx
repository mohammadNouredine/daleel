"use client"

import Image from "next/image"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PropertyListing } from "../types"
import {
  getPropertyListingCoverUrl,
  getPropertyTypeIcon,
} from "../utils/property-listing-display"

type PropertyListingCoverProps = {
  listing: PropertyListing
  className?: string
  sizes?: string
  priority?: boolean
}

export function PropertyListingCover({
  listing,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: PropertyListingCoverProps) {
  const coverUrl = getPropertyListingCoverUrl(listing)
  const TypeIcon = getPropertyTypeIcon(listing.propertyType)

  if (coverUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={coverUrl}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={sizes}
          priority={priority}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-primary/10",
        className
      )}
    >
      <TypeIcon
        className="size-12 text-primary/40 sm:size-14"
        strokeWidth={1.25}
        aria-hidden
      />
      <span className="mt-3 flex size-8 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground shadow-sm">
        <MapPin className="size-4" aria-hidden />
      </span>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Daleel
      </span>
    </div>
  )
}
