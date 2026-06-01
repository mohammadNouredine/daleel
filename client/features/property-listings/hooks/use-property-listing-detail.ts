"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingDetailEndpoint,
} from "../endpoints"
import type { PropertyListing } from "../types"

type UsePropertyListingDetailParams = {
  id: string
  enabled?: boolean
}

export function usePropertyListingDetail({
  id,
  enabled = true,
}: UsePropertyListingDetailParams) {
  return useReadData<PropertyListing>({
    queryKey: [...PROPERTY_LISTINGS_QUERY_KEY, "detail", id],
    endpoint: propertyListingDetailEndpoint(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  })
}
