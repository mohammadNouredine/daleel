"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "../api-methods"

export interface DeleteDataParams {
  additionalEndpoint?: string
}

type ApiMutationResponse = {
  message: string
}

export function useDeleteData<BodyParams, ResponseData = unknown>({
  queryKeysToInvalidate,
  endpoint,
  showSuccessToast = true,
  callBackOnSuccess,
}: {
  queryKeysToInvalidate?: QueryKey[]
  endpoint: string
  showSuccessToast?: boolean
  callBackOnSuccess?: () => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data?: BodyParams & DeleteDataParams) => {
      const additionalEndpoint = data?.additionalEndpoint ?? ""
      void (0 as unknown as ResponseData)
      const fullEndpoint = `${endpoint}${additionalEndpoint}`
      return sendToApi<ApiMutationResponse>(fullEndpoint, data, "DELETE")
    },
    onSuccess: ({ message }) => {
      queryKeysToInvalidate?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )

      if (showSuccessToast && message) {
        toast.success(message)
      }

      callBackOnSuccess?.()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
