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

export function useUpdateData<BodyParams, ResponseData = unknown>({
  queryKeysToInvalidate,
  endpoint,
  showSuccessToast = true,
  callBackOnSuccess,
}: {
  queryKeysToInvalidate?: QueryKey[]
  endpoint: string
  showSuccessToast?: boolean
  callBackOnSuccess?: (data: ResponseData) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BodyParams) =>
      sendToApi<ApiMutationResponse<ResponseData>>(endpoint, data, "PATCH"),
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
      toast.error(err.message)
    },
  })
}
