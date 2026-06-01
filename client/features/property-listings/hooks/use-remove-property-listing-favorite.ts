"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  PROPERTY_LISTINGS_QUERY_KEY,
  propertyListingFavoriteEndpoint,
} from "../endpoints"
import type { FavoritePropertyListingResponse } from "../types"

export function useRemovePropertyListingFavorite(options?: {
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<FavoritePropertyListingResponse>(
        propertyListingFavoriteEndpoint(id),
        {},
        "DELETE"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_LISTINGS_QUERY_KEY })
      toast.success("Removed from favorites")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
