"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Bath, BedDouble, MapPin, Maximize2, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PropertyListing } from "../types"
import { PropertyListingCover } from "./PropertyListingCover"
import {
  formatListingLocation,
  formatListingPriceLabel,
  formatListingTypeLabel,
  formatPropertyTypeLabel,
} from "../utils/property-listing-display"

type PropertyListingCardProps = {
  listing: PropertyListing
  index?: number
}

export function PropertyListingCard({
  listing,
  index = 0,
}: PropertyListingCardProps) {
  const priceLabel = formatListingPriceLabel(listing)
  const isFree =
    priceLabel.startsWith("Free") || listing.isEmergencyShelter

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="h-full"
    >
      <Link
        href={`/properties/${listing._id}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative">
          <PropertyListingCover
            listing={listing}
            className="aspect-[4/3] w-full"
          />
          <Badge
            className={cn(
              "absolute left-3 top-3 border-0 shadow-sm",
              isFree
                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                : "bg-background/95 text-foreground"
            )}
          >
            {priceLabel}
          </Badge>
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 max-w-[45%] truncate bg-background/90 text-foreground backdrop-blur-sm"
          >
            {formatListingTypeLabel(listing)}
          </Badge>
          {listing.isVerified ? (
            <Badge className="absolute bottom-3 right-3 gap-0.5 border-0 bg-primary/90 text-primary-foreground shadow-sm">
              <ShieldCheck className="size-3" aria-hidden />
              Verified
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 font-semibold leading-snug">
            {listing.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {formatListingLocation(listing)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatPropertyTypeLabel(listing)}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {listing.bedrooms != null ? (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {listing.bedrooms} bed
              </span>
            ) : null}
            {listing.bathrooms != null ? (
              <span className="inline-flex items-center gap-1">
                <Bath className="size-3.5" />
                {listing.bathrooms} bath
              </span>
            ) : null}
            {listing.area != null ? (
              <span className="inline-flex items-center gap-1">
                <Maximize2 className="size-3.5" />
                {listing.area} {listing.areaUnit === "SQFT" ? "ft²" : "m²"}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
