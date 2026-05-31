"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import { useReadData } from "@/lib/api/services/use-read-data"
import {
  HELP_REQUESTS_QUERY_KEY,
  MY_HELP_REQUESTS_QUERY_KEY,
  PENDING_HELP_REQUESTS_QUERY_KEY,
  HELP_REQUESTS_PENDING,
  helpRequestApproveEndpoint,
  helpRequestRejectEndpoint,
} from "../endpoints"
import type { HelpRequest } from "../types"

export function usePendingHelpRequests(enabled = true) {
  return useReadData<HelpRequest[]>({
    queryKey: PENDING_HELP_REQUESTS_QUERY_KEY,
    endpoint: HELP_REQUESTS_PENDING,
    enabled,
    staleTime: 15_000,
  })
}

const invalidateKeys: QueryKey[] = [
  HELP_REQUESTS_QUERY_KEY,
  MY_HELP_REQUESTS_QUERY_KEY,
  PENDING_HELP_REQUESTS_QUERY_KEY,
]

export function useApproveHelpRequest(options?: {
  onSuccess?: (data: HelpRequest) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<HelpRequest>(helpRequestApproveEndpoint(id), {}, "PATCH"),
    onSuccess: (data) => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Request approved")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRejectHelpRequest(options?: {
  onSuccess?: (data: HelpRequest) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      sendToApi<HelpRequest>(
        helpRequestRejectEndpoint(id),
        { reason },
        "PATCH"
      ),
    onSuccess: (data) => {
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Request rejected")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
