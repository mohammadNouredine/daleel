"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingDeleteEndpoint,
} from "../endpoints"

export function useDeletePropertyListing(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const queryKeysToInvalidate: QueryKey[] = [
    PROPERTY_LISTINGS_QUERY_KEY,
    MY_PROPERTY_LISTINGS_QUERY_KEY,
    PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  ]

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<{ message: string }>(
        propertyListingDeleteEndpoint(id),
        {},
        "DELETE"
      ),
    onSuccess: () => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Property listing deleted")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
