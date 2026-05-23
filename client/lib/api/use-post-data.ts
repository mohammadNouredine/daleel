"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { type ApiSuccessResult, sendToApi } from "./api-methods"

export type UsePostDataConfig = {
  endpoint: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
  queryKeysToInvalidate?: QueryKey[]
  skipAuth?: boolean
  successMessage?: string
}

export function usePostData<BodyParams, ResponseData = unknown>(
  {
    endpoint,
    showSuccessToast = true,
    showErrorToast = true,
    queryKeysToInvalidate,
    skipAuth = false,
    successMessage,
  }: UsePostDataConfig,
  mutationOptions?: Omit<
    UseMutationOptions<ApiSuccessResult<ResponseData>, Error, BodyParams>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient()
  const { onSuccess, onError, ...restMutationOptions } = mutationOptions ?? {}

  return useMutation({
    mutationFn: (data: BodyParams) =>
      sendToApi<BodyParams, ResponseData>(endpoint, data, "POST", {
        skipAuth,
        successMessage,
      }),
    onSuccess: (result, variables, onMutateResult, context) => {
      queryKeysToInvalidate?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )

      if (showSuccessToast && result.message) {
        toast.success(result.message)
      }

      onSuccess?.(result, variables, onMutateResult, context)
    },
    onError: (err, variables, onMutateResult, context) => {
      if (showErrorToast) {
        toast.error(err.message)
      }

      onError?.(err, variables, onMutateResult, context)
    },
    ...restMutationOptions,
  })
}
