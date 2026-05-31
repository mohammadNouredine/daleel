"use client"

import { useQuery } from "@tanstack/react-query"
import { useIsAuthenticated } from "@/features/auth/hooks/use-is-authenticated"
import { getFromApi } from "@/lib/api/api-methods"
import { CURRENT_PROFILE_QUERY_KEY, USERS_ME } from "../endpoints"
import type { DaleelProfile } from "../types"

type UsersMeResponse = {
  profile: DaleelProfile
}

export function useCurrentProfile() {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: CURRENT_PROFILE_QUERY_KEY,
    queryFn: async (): Promise<DaleelProfile | undefined> => {
      const response = await getFromApi<UsersMeResponse>(USERS_ME)
      return response.profile
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
    retry: 1,
  })
}
