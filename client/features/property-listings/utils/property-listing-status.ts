import { PropertyListingStatus, type PropertyListingStatusValue } from "../types"

const STATUS_LABELS: Record<PropertyListingStatusValue, string> = {
  [PropertyListingStatus.DRAFT]: "Draft",
  [PropertyListingStatus.PENDING_APPROVAL]: "Pending review",
  [PropertyListingStatus.APPROVED]: "Approved",
  [PropertyListingStatus.REJECTED]: "Rejected",
  [PropertyListingStatus.ARCHIVED]: "Archived",
  [PropertyListingStatus.EXPIRED]: "Expired",
  [PropertyListingStatus.DELETED]: "Deleted",
}

export function formatPropertyListingStatus(
  status: PropertyListingStatusValue
): string {
  return STATUS_LABELS[status] ?? status
}

export function propertyListingStatusBadgeClass(
  status: PropertyListingStatusValue
): string {
  switch (status) {
    case PropertyListingStatus.APPROVED:
      return "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
    case PropertyListingStatus.PENDING_APPROVAL:
      return "bg-amber-500/10 text-amber-800 dark:text-amber-300"
    case PropertyListingStatus.REJECTED:
      return "bg-destructive/10 text-destructive"
    case PropertyListingStatus.DRAFT:
      return "bg-muted text-muted-foreground"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}
