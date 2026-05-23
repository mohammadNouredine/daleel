"use client"

import { Archive, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HelpRequestsViewMode = "active" | "archive"

type HelpRequestsToolbarProps = {
  viewMode: HelpRequestsViewMode
  archiveCount: number
  activeCount: number
  onViewModeChange: (mode: HelpRequestsViewMode) => void
  className?: string
}

export function HelpRequestsToolbar({
  viewMode,
  archiveCount,
  activeCount,
  onViewModeChange,
  className,
}: HelpRequestsToolbarProps) {
  const isArchive = viewMode === "archive"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {isArchive ? (
          <>
            <span className="font-medium text-foreground">
              {archiveCount} completed or inactive
            </span>{" "}
            — no longer accepting help
          </>
        ) : (
          <>
            <span className="font-medium text-foreground">
              {activeCount} open
            </span>{" "}
            — requests that still need support
          </>
        )}
      </p>

      <Button
        type="button"
        variant={isArchive ? "default" : "outline"}
        size="sm"
        className="w-full shrink-0 sm:w-auto"
        onClick={() =>
          onViewModeChange(isArchive ? "active" : "archive")
        }
      >
        {isArchive ? (
          <>
            <ArrowLeft className="size-4" />
            Back to open requests
          </>
        ) : (
          <>
            <Archive className="size-4" />
            Completed & inactive
            {archiveCount > 0 ? (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                {archiveCount}
              </span>
            ) : null}
          </>
        )}
      </Button>
    </div>
  )
}
