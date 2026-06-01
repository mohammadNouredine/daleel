"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import { AMENITIES_LIST, AMENITIES_QUERY_KEY } from "../endpoints"
import type { Amenity } from "../types"

export function useAmenities(enabled = true) {
  return useReadData<Amenity[]>({
    queryKey: AMENITIES_QUERY_KEY,
    endpoint: AMENITIES_LIST,
    enabled,
    staleTime: 60_000,
  })
}
