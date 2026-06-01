"use client"

import { usePostFormData } from "@/lib/api/services/use-post-form-data"
import {
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_CREATE,
  PROPERTY_LISTINGS_QUERY_KEY,
} from "../endpoints"
import type { PropertyListing } from "../types"

export function useCreatePropertyListing(options?: {
  onSuccess?: (data: PropertyListing) => void
  showSuccessToast?: boolean
}) {
  return usePostFormData<PropertyListing>({
    endpoint: PROPERTY_LISTINGS_CREATE,
    queryKeysToInvalidate: [
      PROPERTY_LISTINGS_QUERY_KEY,
      MY_PROPERTY_LISTINGS_QUERY_KEY,
      PENDING_PROPERTY_LISTINGS_QUERY_KEY,
    ],
    showSuccessToast: options?.showSuccessToast ?? true,
    callBackOnSuccess: options?.onSuccess,
  })
}
