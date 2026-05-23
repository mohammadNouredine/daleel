"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "./api-methods"

export function usePostData<BodyParams, ResponseData = unknown>({
  endpoint,
  showSuccessToast = true,
  showErrorToast = true,
  callBackOnSuccess,
  queryKeysToInvalidate,
  skipAuth = false,
  successMessage,
}: {
  endpoint: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
  callBackOnSuccess?: (data: ResponseData) => void
  queryKeysToInvalidate?: QueryKey[]
  skipAuth?: boolean
  successMessage?: string
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BodyParams) =>
      sendToApi<BodyParams, ResponseData>(endpoint, data, "POST", {
        skipAuth,
        successMessage,
      }),
    onSuccess: ({ data, message }) => {
      queryKeysToInvalidate?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )

      if (showSuccessToast && message) {
        toast.success(message)
      }

      callBackOnSuccess?.(data)
    },
    onError: (err: Error) => {
      if (showErrorToast) {
        toast.error(err.message)
      }
    },
  })
}
