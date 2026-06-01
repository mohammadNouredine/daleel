"use client"

import { Plus, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HelpRequestsViewMode = "active" | "archive" | "mine"

type HelpRequestsToolbarProps = {
  viewMode: HelpRequestsViewMode
  archiveCount: number
  activeCount: number
  mineCount?: number
  showMineTab?: boolean
  onViewModeChange: (mode: HelpRequestsViewMode) => void
  className?: string
}

export function HelpRequestsToolbar({
  viewMode,
  archiveCount,
  activeCount,
  mineCount = 0,
  showMineTab = false,
  onViewModeChange,
  className,
}: HelpRequestsToolbarProps) {
  const isArchive = viewMode === "archive"
  const isMine = viewMode === "mine"

  return (
    <div className={cn("space-y-3", className)}>
      {showMineTab ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={viewMode === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("active")}
          >
            Open requests
          </Button>
          <Button
            type="button"
            variant={isMine ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("mine")}
          >
            <UserRound className="size-4" />
            My requests
            {mineCount > 0 ? (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                {mineCount}
              </span>
            ) : null}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isMine ? (
            <>
              <span className="font-medium text-foreground">
                {mineCount} submission{mineCount === 1 ? "" : "s"}
              </span>{" "}
              — including pending review
            </>
          ) : isArchive ? (
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

        {!isMine ? (
          <Button
            type="button"
            variant={isArchive ? "default" : "outline"}
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => onViewModeChange(isArchive ? "active" : "archive")}
          >
            {isArchive ? "Back to open requests" : "Completed & inactive"}
            {!isArchive && archiveCount > 0 ? (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums">
                {archiveCount}
              </span>
            ) : null}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
