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
  userPermissions,
} from "../endpoints"
import type { AdminUser, UserPermissions } from "../types"

export function useUpdateUserPermissions(options?: {
  onSuccess?: (data: AdminUser) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: UserPermissions }) =>
      sendToApi<AdminUser>(userPermissions(id), permissions, "PATCH"),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_LIST_QUERY_KEY })
      queryClient.invalidateQueries({
        queryKey: [...USERS_LIST_QUERY_KEY, "detail", variables.id],
      })
      queryClient.invalidateQueries({ queryKey: CURRENT_PROFILE_QUERY_KEY })
      toast.success("Permissions updated")
      options?.onSuccess?.(data)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
