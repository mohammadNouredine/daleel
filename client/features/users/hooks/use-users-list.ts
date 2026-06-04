"use client"

import { useCallback, useMemo, useState } from "react"
import { useReadData } from "@/lib/api/services/use-read-data"
import { USERS_LIST, USERS_LIST_QUERY_KEY } from "../endpoints"
import type { DaleelProfile, UsersListResponse } from "../types"

export type UsersListFilters = {
  q?: string
  role?: DaleelProfile["role"] | ""
  limit?: number
}

export function useUsersList(filters: UsersListFilters, enabled = true) {
  const [pageIndex, setPageIndex] = useState(0)
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [pageSize, setPageSize] = useState(filters.limit ?? 20)

  const lastId = cursors[pageIndex] ?? null

  const params = useMemo(() => {
    const next: Record<string, string | number> = { limit: pageSize }
    if (lastId) next.lastId = lastId
    if (filters.role) next.role = filters.role
    if (filters.q?.trim()) next.q = filters.q.trim()
    return next
  }, [filters.q, filters.role, lastId, pageSize])

  const query = useReadData<UsersListResponse>({
    queryKey: [...USERS_LIST_QUERY_KEY, filters.q, filters.role, pageSize, pageIndex, lastId],
    endpoint: USERS_LIST,
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

  const onPageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size)
      resetPagination()
    },
    [resetPagination]
  )

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
    pagination,
    resetPagination,
  }
}
