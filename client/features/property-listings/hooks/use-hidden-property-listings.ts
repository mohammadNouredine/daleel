"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_HIDDEN_MODERATION,
} from "../endpoints"
import type { PropertyListing } from "../types"

export function useHiddenPropertyListings(enabled = true) {
  return useReadData<PropertyListing[]>({
    queryKey: HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
    endpoint: PROPERTY_LISTINGS_HIDDEN_MODERATION,
    enabled,
    staleTime: 30_000,
  })
}
