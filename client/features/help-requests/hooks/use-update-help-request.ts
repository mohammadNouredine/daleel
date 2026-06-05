"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendFormDataToApi } from "@/lib/api/api-methods"
import {
  HELP_REQUESTS_QUERY_KEY,
  MY_HELP_REQUESTS_QUERY_KEY,
  PENDING_HELP_REQUESTS_QUERY_KEY,
  helpRequestUpdateEndpoint,
} from "../endpoints"
import type { HelpRequest } from "../types"

export function useUpdateHelpRequest(options?: {
  onSuccess?: (data: HelpRequest) => void
  showSuccessToast?: boolean
}) {
  const queryClient = useQueryClient()
  const queryKeysToInvalidate: QueryKey[] = [
    HELP_REQUESTS_QUERY_KEY,
    MY_HELP_REQUESTS_QUERY_KEY,
    PENDING_HELP_REQUESTS_QUERY_KEY,
  ]
  const showSuccessToast = options?.showSuccessToast ?? true

  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: string
      formData: FormData
    }) =>
      sendFormDataToApi<HelpRequest>(
        helpRequestUpdateEndpoint(id),
        formData,
        "PATCH"
      ),
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      if (showSuccessToast) {
        toast.success(
          data.hasPendingEdit
            ? "Changes submitted for approval. Your request stays live until reviewed."
            : "Saved successfully"
        )
      }
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
