"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "../api-methods"

type ApiMutationResponse<TData> = {
  data: TData
  message: string
}

export function usePostData<BodyParams, ResponseData = unknown>({
  endpoint,
  showSuccessToast = true,
  showErrorToast = true,
  callBackOnSuccess,
  queryKeysToInvalidate,
}: {
  queryKeysToInvalidate?: QueryKey[]
  endpoint: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
  callBackOnSuccess?: (data: ResponseData) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BodyParams) =>
      sendToApi<ApiMutationResponse<ResponseData>>(endpoint, data, "POST"),
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
      if (showErrorToast && err.message.trim()) {
        toast.error(err.message)
      }
    },
  })
}
