"use client"

import { MapPin } from "lucide-react"
import { ImageCarousel } from "@/components/ImageCarousel"
import { cn } from "@/lib/utils"
import type { PropertyListing } from "../types"
import { getPropertyListingImageUrls } from "../utils/property-listing-images"
import {
  getPropertyTypeIcon,
} from "../utils/property-listing-display"

type PropertyListingCoverProps = {
  listing: PropertyListing
  className?: string
  sizes?: string
  priority?: boolean
  /** Carousel indicator style when multiple images exist. */
  indicator?: "dots" | "counter" | "none"
  /** Show nav arrows only on hover (recommended for cards). */
  arrowsOnHover?: boolean
}

export function PropertyListingCover({
  listing,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  indicator = "dots",
  arrowsOnHover = true,
}: PropertyListingCoverProps) {
  const imageUrls = getPropertyListingImageUrls(listing)
  const TypeIcon = getPropertyTypeIcon(listing.propertyType)

  if (imageUrls.length > 0) {
    const slides = imageUrls.map((src, index) => ({
      src,
      alt: `${listing.title} — photo ${index + 1}`,
    }))

    return (
      <ImageCarousel
        images={slides}
        className={className}
        imageClassName="transition-transform duration-500 group-hover:scale-105"
        sizes={sizes}
        priority={priority}
        indicator={indicator}
        arrowsOnHover={arrowsOnHover}
        stopPropagationOnControls
        defaultAlt={listing.title}
      />
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
