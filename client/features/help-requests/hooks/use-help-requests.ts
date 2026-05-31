"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  HELP_REQUESTS_LIST,
  HELP_REQUESTS_QUERY_KEY,
} from "../endpoints"
import type { HelpRequest } from "../types"
import type { HelpRequestFilters } from "../utils/request-filters"

type UseHelpRequestsParams = {
  filters: HelpRequestFilters
  viewMode: "active" | "archive"
}

export function useHelpRequests({ filters, viewMode }: UseHelpRequestsParams) {
  return useReadData<HelpRequest[]>({
    queryKey: [
      ...HELP_REQUESTS_QUERY_KEY,
      viewMode,
      filters.helpType,
      filters.governorate,
      filters.priority,
    ],
    endpoint: HELP_REQUESTS_LIST,
    params: {
      view: viewMode,
      helpType: filters.helpType === "all" ? undefined : filters.helpType,
      governorate:
        filters.governorate === "all" ? undefined : filters.governorate,
      priority: filters.priority === "all" ? undefined : filters.priority,
    },
    staleTime: 30_000,
  })
}
