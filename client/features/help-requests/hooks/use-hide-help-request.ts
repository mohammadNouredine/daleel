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
  helpRequestHideEndpoint,
} from "../endpoints"
import type { HelpRequest } from "../types"

const invalidateKeys: QueryKey[] = [
  HELP_REQUESTS_QUERY_KEY,
  MY_HELP_REQUESTS_QUERY_KEY,
]

export function useHideHelpRequest(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<HelpRequest>(helpRequestHideEndpoint(id), {}, "PATCH"),
    onSuccess: () => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Request hidden from active list")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
