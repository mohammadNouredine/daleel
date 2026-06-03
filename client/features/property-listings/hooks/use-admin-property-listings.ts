"use client"

import { useCallback, useMemo, useState } from "react"
import { useReadData } from "@/lib/api/services/use-read-data"
import {
  ADMIN_PROPERTY_LISTINGS_QUERY_KEY,
  PROPERTY_LISTINGS_ADMIN,
} from "../endpoints"
import type {
  AdminPropertyListingsResponse,
  ListingTypeValue,
  PropertyListingStatusValue,
} from "../types"

export type AdminPropertyListFilters = {
  status?: PropertyListingStatusValue | ""
  listingType?: ListingTypeValue | ""
  q?: string
  limit?: number
}

export function useAdminPropertyListings(
  filters: AdminPropertyListFilters,
  enabled = true
) {
  const [pageIndex, setPageIndex] = useState(0)
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [pageSize, setPageSize] = useState(filters.limit ?? 20)

  const lastId = cursors[pageIndex] ?? null

  const params = useMemo(() => {
    const next: Record<string, string | number> = { limit: pageSize }
    if (lastId) next.lastId = lastId
    if (filters.status) next.status = filters.status
    if (filters.listingType) next.listingType = filters.listingType
    if (filters.q?.trim()) next.q = filters.q.trim()
    return next
  }, [filters.listingType, filters.q, filters.status, lastId, pageSize])

  const query = useReadData<AdminPropertyListingsResponse>({
    queryKey: [
      ...ADMIN_PROPERTY_LISTINGS_QUERY_KEY,
      filters.status,
      filters.listingType,
      filters.q,
      pageSize,
      pageIndex,
      lastId,
    ],
    endpoint: PROPERTY_LISTINGS_ADMIN,
    params,
    enabled,
    staleTime: 15_000,
  })

  const resetPagination = useCallback(() => {
    setPageIndex(0)
    setCursors([null])
  }, [])

  const onNextPage = useCallback(() => {
    const nextLastId = query.data?.nextLastId
    if (!nextLastId) return
    setCursors((prev) => {
      const trimmed = prev.slice(0, pageIndex + 1)
      return [...trimmed, nextLastId]
    })
    setPageIndex((prev) => prev + 1)
  }, [pageIndex, query.data?.nextLastId])

  const onPreviousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const onPageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    resetPagination()
  }, [resetPagination])

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageCount: cursors.length,
      hasNextPage: Boolean(query.data?.nextLastId),
      hasPreviousPage: pageIndex > 0,
      onNextPage,
      onPreviousPage,
      pageSize,
      onPageSizeChange,
    }),
    [
      cursors.length,
      onNextPage,
      onPageSizeChange,
      onPreviousPage,
      pageIndex,
      pageSize,
      query.data?.nextLastId,
    ]
  )

  return {
    ...query,
    items: query.data?.items ?? [],
    summary: query.data?.summary,
    pagination,
    resetPagination,
  }
}
