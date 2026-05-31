"use client"

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendFormDataToApi } from "../api-methods"

export function usePostFormData<ResponseData = unknown>({
  endpoint,
  queryKeysToInvalidate,
  showSuccessToast = true,
  callBackOnSuccess,
}: {
  endpoint: string
  queryKeysToInvalidate?: QueryKey[]
  showSuccessToast?: boolean
  callBackOnSuccess?: (data: ResponseData) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) =>
      sendFormDataToApi<ResponseData>(endpoint, formData, "POST"),
    onSuccess: (data) => {
      queryKeysToInvalidate?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      if (showSuccessToast) {
        toast.success("Saved successfully")
      }
      callBackOnSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function usePatchFormData<ResponseData = unknown>({
  endpoint,
  queryKeysToInvalidate,
  showSuccessToast = true,
  callBackOnSuccess,
}: {
  endpoint: string
  queryKeysToInvalidate?: QueryKey[]
  showSuccessToast?: boolean
  callBackOnSuccess?: (data: ResponseData) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) =>
      sendFormDataToApi<ResponseData>(endpoint, formData, "PATCH"),
    onSuccess: (data) => {
      queryKeysToInvalidate?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
      if (showSuccessToast) {
        toast.success("Saved successfully")
      }
      callBackOnSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
