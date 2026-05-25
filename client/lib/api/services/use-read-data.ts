"use client"

import {
  type QueryKey,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query"
import { getFromApi } from "../api-methods"

export function useReadData<ReturnedDataType>({
  queryKey,
  endpoint,
  refetchOnWindowFocus = true,
  refetchOnMount = true,
  staleTime = 0,
  enabled = true,
  keepPreviousData: shouldKeepPreviousData = false,
  retry = 3,
  withoutUrlPrefix = false,
  params,
}: {
  queryKey: QueryKey
  endpoint: string
  refetchOnWindowFocus?: boolean
  refetchOnMount?: boolean
  staleTime?: number
  enabled?: boolean
  keepPreviousData?: boolean
  retry?: boolean | number
  withoutUrlPrefix?: boolean
  params?: Record<string, unknown>
}) {
  return useQuery<ReturnedDataType>({
    queryKey,
    queryFn: () => getFromApi(endpoint, withoutUrlPrefix, params),
    refetchOnWindowFocus,
    refetchOnMount,
    staleTime,
    enabled,
    retry,
    placeholderData: shouldKeepPreviousData ? keepPreviousData : undefined,
  })
}
