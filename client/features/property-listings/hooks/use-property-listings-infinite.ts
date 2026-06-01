"use client"

import { useInfiniteReadData } from "@/lib/api/services/use-infinite-read-data"
import { DEFAULT_PROPERTY_LISTING_PAGE_SIZE } from "../constants"
import {
  PROPERTY_LISTINGS_LIST,
  PROPERTY_LISTINGS_QUERY_KEY,
} from "../endpoints"
import type { PropertyListingPaginatedResponse } from "../types"
import {
  buildPropertyListingListParams,
  type PropertyListingListFilters,
} from "../utils/property-listing-filters"

type UsePropertyListingsInfiniteParams = {
  filters: PropertyListingListFilters
  enabled?: boolean
}

export function usePropertyListingsInfinite({
  filters,
  enabled = true,
}: UsePropertyListingsInfiniteParams) {
  const limit = filters.limit ?? DEFAULT_PROPERTY_LISTING_PAGE_SIZE
  const params = buildPropertyListingListParams({ ...filters, limit })

  return useInfiniteReadData<PropertyListingPaginatedResponse, string | null>(
    {
      queryKey: [
        ...PROPERTY_LISTINGS_QUERY_KEY,
        "infinite",
        filters.listingType,
        filters.propertyType,
        filters.governorate,
        filters.city,
        filters.district,
        filters.priceMin,
        filters.priceMax,
        filters.currency,
        filters.areaMin,
        filters.areaMax,
        filters.bedrooms,
        filters.bathrooms,
        filters.furnishingStatus,
        filters.isEmergencyShelter,
        filters.acceptFamilies,
        filters.acceptChildren,
        filters.acceptPets,
        filters.womenOnly,
        filters.menOnly,
        filters.isVerified,
        filters.isAvailable,
        filters.amenityIds?.join(","),
        limit,
      ],
      endpoint: PROPERTY_LISTINGS_LIST,
      initialPageParam: null,
      getNextPageParam: (lastPage) =>
        (lastPage as PropertyListingPaginatedResponse).nextLastId,
      params,
      enabled,
    }
  )
}
