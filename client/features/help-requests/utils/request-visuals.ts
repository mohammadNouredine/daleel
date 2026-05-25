import type {
  HelpRequestStatusValue,
  HelpTypeValue,
  PriorityLevelValue,
} from "../types"
import {
  HelpRequestStatus,
  HelpType,
  PriorityLevel,
} from "../types"

/** Status badge — urgency / fulfillment state */
export function getStatusBadgeClass(status: HelpRequestStatusValue): string {
  switch (status) {
    case HelpRequestStatus.ACTIVE:
      return "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200"
    case HelpRequestStatus.PARTIALLY_FULFILLED:
      return "border-amber-200 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    case HelpRequestStatus.FULFILLED:
      return "border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
    case HelpRequestStatus.EXPIRED:
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
    case HelpRequestStatus.CANCELLED:
      return "border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

/** Priority badge — how urgent the need is */
export function getPriorityBadgeClass(priority: PriorityLevelValue): string {
  switch (priority) {
    case PriorityLevel.CRITICAL:
      return "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100"
    case PriorityLevel.HIGH:
      return "border-orange-200 bg-orange-100 text-orange-950 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
    case PriorityLevel.MEDIUM:
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    case PriorityLevel.LOW:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export function getVerifiedBadgeClass(): string {
  return "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200"
}

/** Category chips — help type */
export function getHelpTypeTagClass(helpType: HelpTypeValue): string {
  switch (helpType) {
    case HelpType.MATERIAL:
      return "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200"
    case HelpType.FINANCIAL:
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
    case HelpType.MEDICAL:
      return "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200"
    case HelpType.SHELTER:
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
    case HelpType.TRANSPORT:
      return "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/** Category chips — sub-category (neutral tint per family) */
export function getSubCategoryTagClass(): string {
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
}

/** Progress fill color by % fulfilled */
export function getProgressFillClass(progress: number): string {
  if (progress >= 100) return "bg-emerald-500 dark:bg-emerald-400"
  if (progress >= 67) return "bg-sky-500 dark:bg-sky-400"
  if (progress >= 34) return "bg-amber-500 dark:bg-amber-400"
  if (progress > 0) return "bg-orange-500 dark:bg-orange-400"
  return "bg-slate-300 dark:bg-slate-600"
}

export function getProgressLabelClass(progress: number): string {
  if (progress >= 100) return "font-medium text-emerald-700 dark:text-emerald-400"
  if (progress >= 67) return "font-medium text-sky-700 dark:text-sky-400"
  if (progress >= 34) return "font-medium text-amber-700 dark:text-amber-400"
  if (progress > 0) return "font-medium text-orange-700 dark:text-orange-400"
  return "text-muted-foreground"
}

export function getProgressTrackClass(): string {
  return "bg-slate-200 dark:bg-slate-800"
}

/** Dialog left accent — urgency from priority, not fulfillment status */
export function getPriorityDialogAccentClass(
  priority: PriorityLevelValue
): string {
  switch (priority) {
    case PriorityLevel.CRITICAL:
      return "border-l-rose-500"
    case PriorityLevel.HIGH:
      return "border-l-orange-500"
    case PriorityLevel.MEDIUM:
      return "border-l-amber-400"
    case PriorityLevel.LOW:
      return "border-l-slate-300 dark:border-l-slate-600"
    default:
      return "border-l-border"
  }
}

export function getPriorityDialogHeaderTintClass(
  priority: PriorityLevelValue
): string {
  switch (priority) {
    case PriorityLevel.CRITICAL:
      return "bg-rose-50/80 dark:bg-rose-950/30"
    case PriorityLevel.HIGH:
      return "bg-orange-50/70 dark:bg-orange-950/25"
    case PriorityLevel.MEDIUM:
      return "bg-amber-50/50 dark:bg-amber-950/20"
    default:
      return "bg-transparent"
  }
}
