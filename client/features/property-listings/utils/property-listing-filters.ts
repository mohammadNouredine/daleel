import type {
  CurrencyValue,
  FurnishingStatusValue,
  ListingTypeValue,
  PropertyTypeValue,
} from "../types"

export type PropertyListingListFilters = {
  listingType?: ListingTypeValue
  propertyType?: PropertyTypeValue
  governorate?: string
  city?: string
  district?: string
  priceMin?: number
  priceMax?: number
  currency?: CurrencyValue
  areaMin?: number
  areaMax?: number
  bedrooms?: number
  bathrooms?: number
  furnishingStatus?: FurnishingStatusValue
  isEmergencyShelter?: boolean
  acceptFamilies?: boolean
  acceptChildren?: boolean
  acceptPets?: boolean
  womenOnly?: boolean
  menOnly?: boolean
  isVerified?: boolean
  isAvailable?: boolean
  amenityIds?: string[]
  limit?: number
}

export function buildPropertyListingListParams(
  filters: PropertyListingListFilters
): Record<string, unknown> {
  return {
    listingType: filters.listingType,
    propertyType: filters.propertyType,
    governorate:
      filters.governorate && filters.governorate !== "all"
        ? filters.governorate
        : undefined,
    city:
      filters.city && filters.city !== "all" ? filters.city : undefined,
    district:
      filters.district && filters.district !== "all"
        ? filters.district
        : undefined,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    currency: filters.currency,
    areaMin: filters.areaMin,
    areaMax: filters.areaMax,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    furnishingStatus: filters.furnishingStatus,
    isEmergencyShelter: filters.isEmergencyShelter || undefined,
    acceptFamilies: filters.acceptFamilies || undefined,
    acceptChildren: filters.acceptChildren || undefined,
    acceptPets: filters.acceptPets || undefined,
    womenOnly: filters.womenOnly || undefined,
    menOnly: filters.menOnly || undefined,
    isVerified: filters.isVerified || undefined,
    isAvailable: filters.isAvailable,
    amenityIds:
      filters.amenityIds?.length ? filters.amenityIds.join(",") : undefined,
    limit: filters.limit,
  }
}
