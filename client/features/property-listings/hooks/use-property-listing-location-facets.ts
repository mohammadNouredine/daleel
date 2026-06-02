"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  PROPERTY_LISTINGS_LOCATION_FACETS,
  PROPERTY_LISTINGS_LOCATION_FACETS_QUERY_KEY,
} from "../endpoints"
import type { PropertyListingLocationFacets } from "../types"

export function usePropertyListingLocationFacets(enabled = true) {
  return useReadData<PropertyListingLocationFacets>({
    queryKey: PROPERTY_LISTINGS_LOCATION_FACETS_QUERY_KEY,
    endpoint: PROPERTY_LISTINGS_LOCATION_FACETS,
    enabled,
    staleTime: 60_000,
  })
}
