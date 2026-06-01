"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Bath,
  BedDouble,
  MapPin,
  Maximize2,
  ShieldCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HomeFooter } from "@/features/home/components/HomeFooter"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import { usePropertyListingDetail } from "../hooks/use-property-listing-detail"
import { PropertyListingCover } from "./PropertyListingCover"
import { PropertyListingCardSkeleton } from "./PropertyListingCardSkeleton"
import {
  formatListingLocation,
  formatListingPriceLabel,
  formatListingTypeLabel,
  formatPropertyTypeLabel,
} from "../utils/property-listing-display"

export function PropertyListingDetailView() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const { data: listing, isLoading, isError, refetch } = usePropertyListingDetail(
    { id, enabled: Boolean(id) }
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/properties"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 inline-flex gap-1.5"
          )}
        >
          <ArrowLeft className="size-4" />
          Back to listings
        </Link>

        {isLoading ? (
          <PropertyListingCardSkeleton count={1} />
        ) : isError || !listing ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="text-sm text-destructive">
              Could not load this listing.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <PropertyListingCover
              listing={listing}
              className="aspect-[21/9] w-full"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start gap-2">
                <Badge variant="secondary">
                  {formatListingTypeLabel(listing)}
                </Badge>
                <Badge variant="outline">{formatPropertyTypeLabel(listing)}</Badge>
                {listing.isVerified ? (
                  <Badge className="gap-0.5 border-0 bg-primary text-primary-foreground">
                    <ShieldCheck className="size-3" />
                    Verified
                  </Badge>
                ) : null}
                {listing.isEmergencyShelter ? (
                  <Badge className="border-0 bg-emerald-600 text-white">
                    Emergency shelter
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {listing.title}
              </h1>

              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                {formatListingLocation(listing)}
              </p>

              <p className="mt-4 text-lg font-medium text-primary">
                {formatListingPriceLabel(listing)}
              </p>

              <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {listing.description}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
                {listing.bedrooms != null ? (
                  <div>
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BedDouble className="size-3.5" />
                      Bedrooms
                    </dt>
                    <dd className="mt-0.5 font-medium">{listing.bedrooms}</dd>
                  </div>
                ) : null}
                {listing.bathrooms != null ? (
                  <div>
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bath className="size-3.5" />
                      Bathrooms
                    </dt>
                    <dd className="mt-0.5 font-medium">{listing.bathrooms}</dd>
                  </div>
                ) : null}
                {listing.area != null ? (
                  <div>
                    <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Maximize2 className="size-3.5" />
                      Area
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {listing.area}{" "}
                      {listing.areaUnit === "SQFT" ? "ft²" : "m²"}
                    </dd>
                  </div>
                ) : null}
                {listing.furnishingStatus ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Furnishing</dt>
                    <dd className="mt-0.5 font-medium">
                      {listing.furnishingStatus.replace(/_/g, " ")}
                    </dd>
                  </div>
                ) : null}
                {listing.maxOccupancy != null ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Max occupancy</dt>
                    <dd className="mt-0.5 font-medium">{listing.maxOccupancy}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  listing.acceptFamilies ? "Families" : null,
                  listing.acceptChildren ? "Children" : null,
                  listing.acceptPets ? "Pets" : null,
                  listing.womenOnly ? "Women only" : null,
                  listing.menOnly ? "Men only" : null,
                ]
                  .filter((label): label is string => label != null)
                  .map((label) => (
                    <Badge key={label} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
              </div>
            </div>
          </article>
        )}
      </main>
      <HomeFooter />
    </div>
  )
}
