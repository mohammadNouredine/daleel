"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_PENDING,
} from "../endpoints"
import type { PropertyListing } from "../types"

export function usePendingPropertyListings(enabled = true) {
  return useReadData<PropertyListing[]>({
    queryKey: PENDING_PROPERTY_LISTINGS_QUERY_KEY,
    endpoint: PROPERTY_LISTINGS_PENDING,
    enabled,
    staleTime: 15_000,
  })
}
