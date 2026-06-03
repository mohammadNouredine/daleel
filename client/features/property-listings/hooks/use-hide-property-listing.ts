"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  ADMIN_PROPERTY_LISTINGS_QUERY_KEY,
  HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingHideEndpoint,
} from "../endpoints"
import type { PropertyListing } from "../types"

const baseInvalidateKeys: QueryKey[] = [
  PROPERTY_LISTINGS_QUERY_KEY,
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
  ADMIN_PROPERTY_LISTINGS_QUERY_KEY,
]

export function useHidePropertyListing(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<PropertyListing>(propertyListingHideEndpoint(id), {}, "PATCH"),
    onSuccess: (_data, id) => {
      baseInvalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      queryClient.invalidateQueries({
        queryKey: [...PROPERTY_LISTINGS_QUERY_KEY, "detail", id],
      })
      toast.success("Listing hidden from the public")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
