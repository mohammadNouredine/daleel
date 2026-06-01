"use client"

import { useInfiniteReadData } from "@/lib/api/services/use-infinite-read-data"
import { DEFAULT_PROPERTY_LISTING_PAGE_SIZE } from "../constants"
import {
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_MINE,
} from "../endpoints"
import type { PropertyListingPaginatedResponse } from "../types"
import {
  buildPropertyListingListParams,
  type PropertyListingListFilters,
} from "../utils/property-listing-filters"

type UseMyPropertyListingsInfiniteParams = {
  filters?: PropertyListingListFilters
  enabled?: boolean
}

export function useMyPropertyListingsInfinite({
  filters = {},
  enabled = true,
}: UseMyPropertyListingsInfiniteParams = {}) {
  const limit = filters.limit ?? DEFAULT_PROPERTY_LISTING_PAGE_SIZE
  const params = buildPropertyListingListParams({ ...filters, limit })

  return useInfiniteReadData<PropertyListingPaginatedResponse, string | null>(
    {
      queryKey: [
        ...MY_PROPERTY_LISTINGS_QUERY_KEY,
        "infinite",
        filters.listingType,
        filters.propertyType,
        limit,
      ],
      endpoint: PROPERTY_LISTINGS_MINE,
      initialPageParam: null,
      getNextPageParam: (lastPage) =>
        (lastPage as PropertyListingPaginatedResponse).nextLastId,
      params,
      enabled,
    }
  )
}
