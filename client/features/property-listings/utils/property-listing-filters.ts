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
  return countActivePropertyListingFilters(filters) > 0
}

export function countActivePropertyListingFilters(
  filters: PropertyListingUiFilters
): number {
  let count = 0

  if (filters.listingType !== undefined) count++
  if (filters.propertyType !== undefined) count++
  if (filters.governorate !== undefined && filters.governorate !== "all")
    count++
  if (filters.city !== undefined && filters.city !== "all") count++
  if (filters.priceMin !== undefined) count++
  if (filters.priceMax !== undefined) count++
  if (filters.currency !== undefined) count++
  if (filters.areaMin !== undefined) count++
  if (filters.areaMax !== undefined) count++
  if (filters.bedrooms !== undefined) count++
  if (filters.bathrooms !== undefined) count++
  if (filters.furnishingStatus !== undefined) count++
  if (filters.isEmergencyShelter === true) count++
  if (filters.acceptFamilies === true) count++
  if (filters.acceptChildren === true) count++
  if (filters.acceptPets === true) count++
  if (filters.womenOnly === true) count++
  if (filters.menOnly === true) count++
  if (filters.isVerified === true) count++
  if (filters.isAvailable === false) count++
  if ((filters.amenityIds?.length ?? 0) > 0) count++

  return count
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
