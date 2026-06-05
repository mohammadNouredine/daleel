"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import toast from "react-hot-toast"
import { sendToApi } from "@/lib/api/api-methods"
import {
  CURRENT_PROFILE_QUERY_KEY,
  USERS_ME,
} from "../endpoints"
import type { UpdateMyProfileInput, UsersMeResponse } from "../types"

export function useUpdateMyProfile(options?: {
  onSuccess?: (profile: UsersMeResponse["profile"]) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateMyProfileInput) =>
      sendToApi<UsersMeResponse>(USERS_ME, data, "PATCH"),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CURRENT_PROFILE_QUERY_KEY })
      toast.success("Profile updated")
      options?.onSuccess?.(response.profile)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
