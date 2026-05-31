"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  HELP_REQUESTS_QUERY_KEY,
  MY_HELP_REQUESTS_QUERY_KEY,
} from "../endpoints"
import { helpRequestDeleteEndpoint } from "../endpoints"

export function useDeleteHelpRequest(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const queryKeysToInvalidate: QueryKey[] = [
    HELP_REQUESTS_QUERY_KEY,
    MY_HELP_REQUESTS_QUERY_KEY,
  ]

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<{ message: string }>(
        helpRequestDeleteEndpoint(id),
        {},
        "DELETE"
      ),
    onSuccess: () => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Help request deleted")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
