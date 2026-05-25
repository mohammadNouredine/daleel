import { PriorityLevel, type PriorityLevelValue } from "@/features/help-requests/types"

export type PrioritySegmentConfig = {
  value: PriorityLevelValue
  label: string
  /** Stop color on the urgency spectrum (left → right) */
  color: string
  tagClass: string
  ringClass: string
}

/** Smooth urgency ramp: cool gray → teal → amber → orange → red */
export const PRIORITY_SEGMENTS: PrioritySegmentConfig[] = [
  {
    value: PriorityLevel.LOW,
    label: "Low",
    color: "#94a3b8",
    tagClass:
      "bg-slate-500/90 text-white shadow-slate-500/25 dark:bg-slate-400/90",
    ringClass: "ring-slate-400/50",
  },
  {
    value: PriorityLevel.MEDIUM,
    label: "Medium",
    color: "#38bdf8",
    tagClass:
      "bg-sky-500/90 text-white shadow-sky-500/30 dark:bg-sky-400/90",
    ringClass: "ring-sky-400/50",
  },
  {
    value: PriorityLevel.HIGH,
    label: "High",
    color: "#f59e0b",
    tagClass:
      "bg-amber-500/90 text-white shadow-amber-500/30 dark:bg-amber-400/90",
    ringClass: "ring-amber-400/50",
  },
  {
    value: PriorityLevel.CRITICAL,
    label: "Critical",
    color: "#ef4444",
    tagClass:
      "bg-red-500/90 text-white shadow-red-500/35 dark:bg-red-500/90",
    ringClass: "ring-red-500/50",
  },
]

export const PRIORITY_GRADIENT = `linear-gradient(to right, ${PRIORITY_SEGMENTS.map((s) => s.color).join(", ")})`

export function getPrioritySegment(value: PriorityLevelValue) {
  return PRIORITY_SEGMENTS.find((s) => s.value === value) ?? PRIORITY_SEGMENTS[2]
}

export function getPriorityIndex(value: PriorityLevelValue) {
  const index = PRIORITY_SEGMENTS.findIndex((s) => s.value === value)
  return index >= 0 ? index : 2
}

export function getPriorityFromPointer(
  clientX: number,
  rect: DOMRect,
  segmentCount = PRIORITY_SEGMENTS.length
): number {
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  // Floor buckets: each segment owns [i/n, (i+1)/n) so clicks don't jump ahead at dividers
  const index = Math.floor(ratio * segmentCount)
  return Math.min(segmentCount - 1, Math.max(0, index))
}
