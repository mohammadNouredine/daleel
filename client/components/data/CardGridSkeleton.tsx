import { cn } from "@/lib/utils"

type CardGridSkeletonProps = {
  count?: number
  className?: string
  columnsClassName?: string
}

export function CardGridSkeleton({
  count = 6,
  className,
  columnsClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: CardGridSkeletonProps) {
  return (
    <div
      className={cn("grid gap-4", columnsClassName, className)}
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
