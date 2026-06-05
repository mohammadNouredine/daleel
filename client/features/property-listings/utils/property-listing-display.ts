import type { LucideIcon } from "lucide-react"
import {
  Building,
  Building2,
  DoorOpen,
  Home,
  LayoutGrid,
  Store,
  Trees,
  HeartHandshake,
} from "lucide-react"
import {
  Currency,
  ListingType,
  PricePeriod,
  type PropertyListing,
  type PropertyTypeValue,
} from "../types"
import { getPropertyListingImageUrls } from "./property-listing-images"

const PRICE_PERIOD_LABELS: Record<string, string> = {
  [PricePeriod.NIGHTLY]: "/night",
  [PricePeriod.WEEKLY]: "/week",
  [PricePeriod.MONTHLY]: "/mo",
  [PricePeriod.QUARTERLY]: "/quarter",
  [PricePeriod.YEARLY]: "/year",
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  [ListingType.RENT]: "Rent",
  [ListingType.SALE]: "Sale",
  [ListingType.SHELTER]: "Shelter",
  [ListingType.SHORT_TERM]: "Short term",
  [ListingType.ROOMMATE]: "Roommate",
  [ListingType.FREE_STAY]: "Free stay",
  TEMPORARY_HOUSING: "Short term",
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  VILLA: "Villa",
  ROOM: "Room",
  STUDIO: "Studio",
  SHELTER: "Shelter",
  COMMERCIAL: "Commercial",
  LAND: "Land",
  BUILDING: "Building",
}

const PROPERTY_TYPE_ICONS: Record<PropertyTypeValue, LucideIcon> = {
  APARTMENT: Building2,
  HOUSE: Home,
  VILLA: Home,
  ROOM: DoorOpen,
  STUDIO: LayoutGrid,
  SHELTER: HeartHandshake,
  COMMERCIAL: Store,
  LAND: Trees,
  BUILDING: Building,
}

export function getPropertyListingCoverUrl(
  listing: PropertyListing
): string | null {
  const urls = getPropertyListingImageUrls(listing)
  return urls[0] ?? null
}

export function formatListingLocation(listing: PropertyListing): string {
  if (listing.location.formattedAddress?.trim()) {
    return listing.location.formattedAddress.trim()
  }
  const parts = [listing.location.city, listing.location.governorate].filter(
    Boolean
  )
  return parts.join(", ") || listing.location.country
}

export function formatListingPriceLabel(listing: PropertyListing): string {
  if (listing.listingType === ListingType.FREE_STAY) {
    return "Free stay"
  }

  if (
    listing.listingType === ListingType.SHELTER ||
    listing.isEmergencyShelter
  ) {
    return "Free / Shelter"
  }

  if (listing.price == null) {
    return listing.isPriceNegotiable ? "Price on request" : "Contact for price"
  }

  const currency = listing.currency ?? Currency.USD
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(listing.price)

  const period = listing.pricePeriod
    ? (PRICE_PERIOD_LABELS[listing.pricePeriod] ?? "")
    : ""

  const negotiable = listing.isPriceNegotiable ? " · Negotiable" : ""

  return `${formatted}${period}${negotiable}`
}

export function formatListingTypeLabel(listing: PropertyListing): string {
  return LISTING_TYPE_LABELS[listing.listingType] ?? listing.listingType
}

export function formatPropertyTypeLabel(listing: PropertyListing): string {
  return PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType
}

export function getPropertyTypeIcon(
  propertyType: PropertyTypeValue
): LucideIcon {
  return PROPERTY_TYPE_ICONS[propertyType] ?? Building2
}

export function verifiedListingBadgeClass(): string {
  return "gap-0.5 border-0 bg-emerald-600 text-white shadow-sm hover:bg-emerald-600"
}

export function shouldShowVerifiedListingBadge(
  listing: PropertyListing
): boolean {
  return listing.isVerified || listing.listedBy?.isTrustedLister === true
}
