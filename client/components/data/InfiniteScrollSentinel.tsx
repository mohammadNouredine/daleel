"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type InfiniteScrollSentinelProps = {
  sentinelRef: (node: Element | null) => void
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  isError?: boolean
  onRetry?: () => void
  className?: string
}

export function InfiniteScrollSentinel({
  sentinelRef,
  isFetchingNextPage = false,
  hasNextPage = false,
  isError = false,
  onRetry,
  className,
}: InfiniteScrollSentinelProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-8", className)}
    >
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden />

      {isError && onRetry ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Could not load more items.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}

      {isFetchingNextPage ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading more…
        </div>
      ) : null}

      {!hasNextPage && !isFetchingNextPage && !isError ? (
        <p className="text-xs text-muted-foreground">End of list</p>
      ) : null}
    </div>
  )
}
