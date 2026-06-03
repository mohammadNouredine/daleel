"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingApproveEndpoint,
  propertyListingRejectEndpoint,
} from "../endpoints"
import type { PropertyListing } from "../types"

const invalidateKeys: QueryKey[] = [
  PROPERTY_LISTINGS_QUERY_KEY,
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
]

export function useApprovePropertyListing(options?: {
  onSuccess?: (data: PropertyListing) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<PropertyListing>(
        propertyListingApproveEndpoint(id),
        {},
        "PATCH"
      ),
    onSuccess: (data) => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Listing approved")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRejectPropertyListing(options?: {
  onSuccess?: (data: PropertyListing) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: string
      rejectionReason: string
    }) =>
      sendToApi<PropertyListing>(
        propertyListingRejectEndpoint(id),
        { rejectionReason },
        "PATCH"
      ),
    onSuccess: (data) => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Listing rejected")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
