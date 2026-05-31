"use client"

import { useReadData } from "@/lib/api/services/use-read-data"
import {
  HELP_REQUESTS_MINE,
  MY_HELP_REQUESTS_QUERY_KEY,
} from "../endpoints"
import type { HelpRequest, HelpRequestSortValue } from "../types"
import { buildHelpRequestSortParams } from "../utils/request-sort"
import type { UserCoordinates } from "./use-user-location"

type UseMyHelpRequestsParams = {
  enabled?: boolean
  sort: HelpRequestSortValue
  userCoords: UserCoordinates | null
}

export function useMyHelpRequests({
  enabled = true,
  sort,
  userCoords,
}: UseMyHelpRequestsParams) {
  const sortParams = buildHelpRequestSortParams(sort, userCoords)
  const waitingForLocation = sort === "nearest" && !userCoords

  return useReadData<HelpRequest[]>({
    queryKey: [
      ...MY_HELP_REQUESTS_QUERY_KEY,
      sortParams.sort,
      sortParams.lat,
      sortParams.lng,
    ],
    endpoint: HELP_REQUESTS_MINE,
    params: {
      sort: sortParams.sort,
      lat: sortParams.lat,
      lng: sortParams.lng,
    },
    enabled: enabled && !waitingForLocation,
    staleTime: 30_000,
  })
}
