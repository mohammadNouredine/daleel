"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  HELP_REQUESTS_LIST,
  HELP_REQUESTS_QUERY_KEY,
} from "../endpoints"
import type { HelpRequest, HelpRequestSortValue } from "../types"
import type { HelpRequestFilters } from "../utils/request-filters"
import { buildHelpRequestSortParams } from "../utils/request-sort"
import type { UserCoordinates } from "./use-user-location"

type UseHelpRequestsParams = {
  filters: HelpRequestFilters
  viewMode: "active" | "archive"
  sort: HelpRequestSortValue
  userCoords: UserCoordinates | null
  enabled?: boolean
}

export function useHelpRequests({
  filters,
  viewMode,
  sort,
  userCoords,
  enabled = true,
}: UseHelpRequestsParams) {
  const sortParams = buildHelpRequestSortParams(sort, userCoords)
  const waitingForLocation = sort === "nearest" && !userCoords

  return useReadData<HelpRequest[]>({
    queryKey: [
      ...HELP_REQUESTS_QUERY_KEY,
      viewMode,
      filters.helpType,
      filters.governorate,
      filters.priority,
      sortParams.sort,
      sortParams.lat,
      sortParams.lng,
    ],
    endpoint: HELP_REQUESTS_LIST,
    params: {
      view: viewMode,
      helpType: filters.helpType === "all" ? undefined : filters.helpType,
      governorate:
        filters.governorate === "all" ? undefined : filters.governorate,
      priority: filters.priority === "all" ? undefined : filters.priority,
      sort: sortParams.sort,
      lat: sortParams.lat,
      lng: sortParams.lng,
    },
    enabled: enabled && !waitingForLocation,
    staleTime: 30_000,
  })
}
