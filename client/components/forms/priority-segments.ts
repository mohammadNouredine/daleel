import { PriorityLevel, type PriorityLevelValue } from "@/features/help-requests/types"

export type PrioritySegmentConfig = {
  value: PriorityLevelValue
  label: string
  /** Selected segment fill */
  activeClass: string
  /** Unselected segment fill */
  idleClass: string
  /** Focus ring color */
  ringClass: string
}

export const PRIORITY_SEGMENTS: PrioritySegmentConfig[] = [
  {
    value: PriorityLevel.LOW,
    label: "Low",
    idleClass: "bg-slate-200/80 dark:bg-slate-700/80",
    activeClass: "bg-slate-500 dark:bg-slate-400",
    ringClass: "ring-slate-400/60",
  },
  {
    value: PriorityLevel.MEDIUM,
    label: "Medium",
    idleClass: "bg-amber-200/70 dark:bg-amber-900/50",
    activeClass: "bg-amber-500 dark:bg-amber-400",
    ringClass: "ring-amber-400/60",
  },
  {
    value: PriorityLevel.HIGH,
    label: "High",
    idleClass: "bg-orange-200/70 dark:bg-orange-900/50",
    activeClass: "bg-orange-500 dark:bg-orange-400",
    ringClass: "ring-orange-400/60",
  },
  {
    value: PriorityLevel.CRITICAL,
    label: "Critical",
    idleClass: "bg-rose-200/70 dark:bg-rose-900/50",
    activeClass: "bg-rose-600 dark:bg-rose-500",
    ringClass: "ring-rose-500/60",
  },
]

export function getPrioritySegment(value: PriorityLevelValue) {
  return PRIORITY_SEGMENTS.find((s) => s.value === value) ?? PRIORITY_SEGMENTS[2]
}
