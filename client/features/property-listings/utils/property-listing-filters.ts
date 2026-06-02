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

export type PropertyListingUiFilters = Omit<
  PropertyListingListFilters,
  "governorate" | "city"
> & {
  governorate?: string
  city?: string
}

export const DEFAULT_PROPERTY_LISTING_UI_FILTERS: PropertyListingUiFilters = {
  governorate: "all",
  city: "all",
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

export function hasActivePropertyListingFilters(
  filters: PropertyListingUiFilters
): boolean {
  return (
    filters.listingType !== undefined ||
    filters.propertyType !== undefined ||
    (filters.governorate !== undefined && filters.governorate !== "all") ||
    (filters.city !== undefined && filters.city !== "all") ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.currency !== undefined ||
    filters.areaMin !== undefined ||
    filters.areaMax !== undefined ||
    filters.bedrooms !== undefined ||
    filters.bathrooms !== undefined ||
    filters.furnishingStatus !== undefined ||
    filters.isEmergencyShelter === true ||
    filters.acceptFamilies === true ||
    filters.acceptChildren === true ||
    filters.acceptPets === true ||
    filters.womenOnly === true ||
    filters.menOnly === true ||
    filters.isVerified === true ||
    filters.isAvailable === false ||
    (filters.amenityIds?.length ?? 0) > 0
  )
}

export function toListFilters(
  ui: PropertyListingUiFilters
): PropertyListingListFilters {
  const { governorate, city, ...rest } = ui
  return {
    ...rest,
    governorate: governorate === "all" ? undefined : governorate,
    city: city === "all" ? undefined : city,
  }
}
