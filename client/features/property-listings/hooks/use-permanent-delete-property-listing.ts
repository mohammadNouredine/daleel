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
  propertyListingPermanentDeleteEndpoint,
} from "../endpoints"

const queryKeysToInvalidate: QueryKey[] = [
  PROPERTY_LISTINGS_QUERY_KEY,
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  HIDDEN_PROPERTY_LISTINGS_QUERY_KEY,
  ADMIN_PROPERTY_LISTINGS_QUERY_KEY,
]

export function usePermanentDeletePropertyListing(options?: {
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<{ message: string }>(
        propertyListingPermanentDeleteEndpoint(id),
        {},
        "DELETE"
      ),
    onSuccess: (_data, id) => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      queryClient.invalidateQueries({
        queryKey: [...PROPERTY_LISTINGS_QUERY_KEY, "detail", id],
      })
      toast.success("Property listing permanently deleted")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
