"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import { USERS_LIST_QUERY_KEY, userDetail } from "../endpoints"

export function useDeleteUser(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      sendToApi<{ message?: string }>(userDetail(id), {}, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_LIST_QUERY_KEY })
      toast.success("User deleted")
      options?.onSuccess?.()
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
