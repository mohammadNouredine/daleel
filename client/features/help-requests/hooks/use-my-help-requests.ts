"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  HELP_REQUESTS_MINE,
  MY_HELP_REQUESTS_QUERY_KEY,
} from "../endpoints"
import type { HelpRequest } from "../types"

export function useMyHelpRequests(enabled = true) {
  return useReadData<HelpRequest[]>({
    queryKey: MY_HELP_REQUESTS_QUERY_KEY,
    endpoint: HELP_REQUESTS_MINE,
    enabled,
    staleTime: 30_000,
  })
}
