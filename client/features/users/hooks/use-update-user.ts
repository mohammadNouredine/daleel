"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  CURRENT_PROFILE_QUERY_KEY,
  USERS_LIST_QUERY_KEY,
  userDetail,
} from "../endpoints"
import type { AdminUser, UpdateUserInput } from "../types"

export function useUpdateUser(options?: {
  onSuccess?: (data: AdminUser) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      sendToApi<AdminUser>(userDetail(id), data, "PATCH"),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_LIST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...USERS_LIST_QUERY_KEY, "detail", variables.id],
      })
      queryClient.invalidateQueries({ queryKey: CURRENT_PROFILE_QUERY_KEY })
      toast.success("User updated")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
