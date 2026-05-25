"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HelpRequestNeedLine } from "../types"
import { HelpRequestNeedKind } from "../types"
import {
  computeNeedsProgress,
  formatNeedQuantity,
  getNeedRemaining,
} from "../utils/request-needs"
import {
  getProgressFillClass,
  getProgressLabelClass,
  getProgressTrackClass,
} from "../utils/request-visuals"

type RequestNeedsProgressProps = {
  needs: HelpRequestNeedLine[]
  variant?: "active" | "archive"
  compact?: boolean
}

function NeedLineRow({
  line,
  showRemainingOnly = false,
}: {
  line: HelpRequestNeedLine
  showRemainingOnly?: boolean
}) {
  const remaining = getNeedRemaining(line)
  const isComplete = remaining === 0
  const linePercent =
    line.required > 0
      ? Math.min(100, Math.round((line.fulfilled / line.required) * 100))
      : 0

  if (showRemainingOnly && isComplete) {
    return null
  }

  return (
    <li className="space-y-1">
      <div className="flex items-start justify-between gap-2 text-xs">
        <span
          className={cn(
            "min-w-0 leading-snug",
            isComplete ? "text-muted-foreground line-through" : "font-medium"
          )}
        >
          {isComplete ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <Check className="size-3 shrink-0" aria-hidden />
              {formatNeedQuantity(line, line.fulfilled)} {line.label}
            </span>
          ) : (
            <>
              <span className="font-semibold tabular-nums">
                {formatNeedQuantity(line, showRemainingOnly ? remaining : line.required)}
              </span>{" "}
              {line.label}
            </>
          )}
        </span>
        {!isComplete ? (
          <span className={cn("shrink-0 tabular-nums", getProgressLabelClass(linePercent))}>
            {line.fulfilled}/{line.required}
          </span>
        ) : null}
      </div>
      {!isComplete ? (
        <div
          className={cn(
            "h-1.5 overflow-hidden rounded-full",
            getProgressTrackClass()
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getProgressFillClass(linePercent)
            )}
            style={{ width: `${linePercent}%` }}
          />
        </div>
      ) : null}
      {line.notes && !showRemainingOnly ? (
        <p className="text-[11px] text-muted-foreground">{line.notes}</p>
      ) : null}
    </li>
  )
}

export function RequestNeedsProgress({
  needs,
  variant = "active",
  compact = false,
}: RequestNeedsProgressProps) {
  const progress = computeNeedsProgress(needs)
  const remainingLines = needs.filter((line) => getNeedRemaining(line) > 0)
  const completedLines = needs.filter(
    (line) => line.fulfilled >= line.required
  )

  if (variant === "archive") {
    return (
      <p className="text-xs text-muted-foreground">
        {progress.completedLines}/{progress.totalLines} lines fulfilled ·{" "}
        {progress.percent}% overall
      </p>
    )
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Overall {progress.totalFulfilled}/{progress.totalRequired}
          </span>
          <span className={getProgressLabelClass(progress.percent)}>
            {progress.percent}%
          </span>
        </div>
        <div className={cn("h-2 overflow-hidden rounded-full", getProgressTrackClass())}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getProgressFillClass(progress.percent)
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Overall progress · {progress.completedLines}/{progress.totalLines}{" "}
            lines done
          </span>
          <span className={getProgressLabelClass(progress.percent)}>
            {progress.percent}%
          </span>
        </div>
        <div className={cn("h-2.5 overflow-hidden rounded-full", getProgressTrackClass())}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getProgressFillClass(progress.percent)
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {completedLines.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Fulfilled
          </p>
          <ul className="space-y-2">
            {completedLines.map((line) => (
              <NeedLineRow key={line.id} line={line} />
            ))}
          </ul>
        </div>
      ) : null}

      {remainingLines.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Remaining
          </p>
          <ul className="space-y-2">
            {remainingLines.map((line) => (
              <NeedLineRow key={line.id} line={line} showRemainingOnly />
            ))}
          </ul>
        </div>
      ) : null}

      {needs.some((line) => line.kind === HelpRequestNeedKind.FINANCIAL) ? (
        <p className="text-[11px] text-muted-foreground">
          Financial lines use the unit field as currency (USD, LBP, etc.).
        </p>
      ) : null}
    </div>
  )
}
