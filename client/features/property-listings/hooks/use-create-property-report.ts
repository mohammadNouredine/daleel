"use client"

import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import { PROPERTY_REPORTS_CREATE } from "../endpoints"
import type {
  CreatePropertyReportInput,
  CreatePropertyReportResponse,
} from "../types"

export function useCreatePropertyReport(options?: {
  onSuccess?: (data: CreatePropertyReportResponse) => void
}) {
  return useMutation({
    mutationFn: (input: CreatePropertyReportInput) =>
      sendToApi<CreatePropertyReportResponse>(
        PROPERTY_REPORTS_CREATE,
        input,
        "POST"
      ),
    onSuccess: (data) => {
      toast.success("Report submitted")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
