"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_MINE,
} from "../endpoints"
import type { PropertyListingPaginatedResponse } from "../types"

export function useMyPropertyListingsCount(enabled = true) {
  const query = useReadData<PropertyListingPaginatedResponse>({
    queryKey: [...MY_PROPERTY_LISTINGS_QUERY_KEY, "count"],
    endpoint: PROPERTY_LISTINGS_MINE,
    params: { limit: 1 },
    enabled,
    staleTime: 30_000,
  })

  const hasListings =
    (query.data?.items.length ?? 0) > 0 ||
    query.data?.nextLastId != null

  return {
    ...query,
    hasListings,
    count: query.data?.items.length ?? 0,
  }
}
