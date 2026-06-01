"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendFormDataToApi } from "@/lib/api/api-methods"
import {
  MY_PROPERTY_LISTINGS_QUERY_KEY,
  PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingUpdateEndpoint,
} from "../endpoints"
import type { PropertyListing } from "../types"

export function useUpdatePropertyListing(options?: {
  onSuccess?: (data: PropertyListing) => void
}) {
  const queryClient = useQueryClient()
  const queryKeysToInvalidate: QueryKey[] = [
    PROPERTY_LISTINGS_QUERY_KEY,
    MY_PROPERTY_LISTINGS_QUERY_KEY,
    PENDING_PROPERTY_LISTINGS_QUERY_KEY,
  ]

  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: string
      formData: FormData
    }) =>
      sendFormDataToApi<PropertyListing>(
        propertyListingUpdateEndpoint(id),
        formData,
        "PATCH"
      ),
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Saved successfully")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
