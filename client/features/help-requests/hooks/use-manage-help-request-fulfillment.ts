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
  helpRequestFulfillmentEndpoint,
} from "../endpoints"
import type { ManageHelpRequestPayload } from "../components/manage-help-request-dialog-context"
import type { HelpRequest } from "../types"

export function useManageHelpRequestFulfillment(options?: {
  onSuccess?: (data: HelpRequest) => void
}) {
  const queryClient = useQueryClient()
  const queryKeysToInvalidate: QueryKey[] = [
    HELP_REQUESTS_QUERY_KEY,
    MY_HELP_REQUESTS_QUERY_KEY,
  ]

  return useMutation({
    mutationFn: (payload: ManageHelpRequestPayload) =>
      sendToApi<HelpRequest>(
        helpRequestFulfillmentEndpoint(payload.requestId, payload.lineId),
        {
          adjustmentType: payload.adjustmentType,
          amount: payload.amount,
        },
        "PATCH"
      ),
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      toast.success("Progress updated")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
