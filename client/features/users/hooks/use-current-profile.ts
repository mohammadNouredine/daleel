"use client"

import { useQuery } from "@tanstack/react-query"
import { getMockProfile } from "../mock-profile"
import type { DaleelProfile } from "../types"

export const CURRENT_PROFILE_QUERY_KEY = ["users", "me"] as const

/** Returns mock profile until the users/me API is integrated. */
export function useCurrentProfile() {
  return useQuery({
    queryKey: CURRENT_PROFILE_QUERY_KEY,
    queryFn: async (): Promise<DaleelProfile> => {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return getMockProfile()
    },
    staleTime: 5 * 60 * 1000,
  })
}
