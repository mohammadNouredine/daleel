"use client"

import { useEffect, useRef } from "react"
import { useInView } from "./use-in-view"

type UseInfiniteScrollTriggerOptions = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  enabled?: boolean
  rootMargin?: string
}

/**
 * Attach returned sentinelRef to a bottom sentinel; loads next page when scrolled into view.
 */
export function useInfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  enabled = true,
  rootMargin = "200px",
}: UseInfiniteScrollTriggerOptions) {
  const { ref: sentinelRef, inView } = useInView({
    rootMargin,
    enabled,
  })

  const fetchNextPageRef = useRef(fetchNextPage)
  fetchNextPageRef.current = fetchNextPage

  const loadingRef = useRef(false)

  useEffect(() => {
    if (!enabled || !inView || !hasNextPage || isFetchingNextPage) {
      return
    }
    if (loadingRef.current) {
      return
    }

    loadingRef.current = true
    fetchNextPageRef.current()
  }, [enabled, inView, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    if (!isFetchingNextPage) {
      loadingRef.current = false
    }
  }, [isFetchingNextPage])

  return { sentinelRef, inView }
}
