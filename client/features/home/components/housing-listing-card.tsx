"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bath, BedDouble, MapPin, Maximize2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HousingListingPreview } from "../types"

type HousingListingCardProps = {
  listing: HousingListingPreview
  index?: number
}

export function HousingListingCard({
  listing,
  index = 0,
}: HousingListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="w-[min(100%,260px)] shrink-0 snap-start sm:w-[280px]"
      role="listitem"
    >
      <Link
        href="#housing-listings"
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="280px"
          />
          <Badge
            className={cn(
              "absolute left-3 top-3 border-0 shadow-sm",
              listing.isFree
                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                : "bg-background/95 text-foreground"
            )}
          >
            {listing.priceLabel}
          </Badge>
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 bg-background/90 text-foreground backdrop-blur-sm"
          >
            {listing.type}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-snug">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {listing.location}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {listing.beds != null ? (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {listing.beds} bed
              </span>
            ) : null}
            {listing.baths != null ? (
              <span className="inline-flex items-center gap-1">
                <Bath className="size-3.5" />
                {listing.baths} bath
              </span>
            ) : null}
            {listing.areaSqm != null ? (
              <span className="inline-flex items-center gap-1">
                <Maximize2 className="size-3.5" />
                {listing.areaSqm} m²
              </span>
            ) : null}
            {listing.capacity ? (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {listing.capacity}
              </span>
            ) : null}
            {listing.amenities?.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
