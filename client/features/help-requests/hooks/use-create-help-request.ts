"use client"

import { usePostFormData } from "@/lib/api/services/use-post-form-data"
import {
  HELP_REQUESTS_CREATE,
  HELP_REQUESTS_QUERY_KEY,
  MY_HELP_REQUESTS_QUERY_KEY,
  PENDING_HELP_REQUESTS_QUERY_KEY,
} from "../endpoints"
import type { HelpRequest } from "../types"

export function useCreateHelpRequest(options?: {
  onSuccess?: (data: HelpRequest) => void
  showSuccessToast?: boolean
}) {
  return usePostFormData<HelpRequest>({
    endpoint: HELP_REQUESTS_CREATE,
    queryKeysToInvalidate: [
      HELP_REQUESTS_QUERY_KEY,
      MY_HELP_REQUESTS_QUERY_KEY,
      PENDING_HELP_REQUESTS_QUERY_KEY,
    ],
    showSuccessToast: options?.showSuccessToast ?? true,
    callBackOnSuccess: options?.onSuccess,
  })
}
