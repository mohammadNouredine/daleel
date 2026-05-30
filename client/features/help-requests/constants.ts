import {
  HelpRequestStatus,
  PriorityLevel,
  Visibility,
  HelpRequestNeedKind,
  type HelpRequestNeedKindValue,
  type HelpRequestStatusValue,
  type PriorityLevelValue,
  type VisibilityValue,
} from "./types"

export const FINANCIAL_CURRENCY_OPTIONS = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "LBP", label: "Lebanese Lira (LBP)" },
] as const

export type FinancialCurrency = (typeof FINANCIAL_CURRENCY_OPTIONS)[number]["value"]

export const LEBANON_MAP_CENTER = {
  lat: 33.8938,
  lng: 35.5018,
} as const

export const MAX_PROOF_IMAGES = 8

export const ACCEPTED_PROOF_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const

export const PRIORITY_OPTIONS: {
  value: PriorityLevelValue
  label: string
}[] = [
  { value: PriorityLevel.LOW, label: "Low" },
  { value: PriorityLevel.MEDIUM, label: "Medium" },
  { value: PriorityLevel.HIGH, label: "High" },
  { value: PriorityLevel.CRITICAL, label: "Critical" },
]

export const NEED_KIND_OPTIONS: {
  value: HelpRequestNeedKindValue
  label: string
}[] = [
  { value: HelpRequestNeedKind.ITEM, label: "Physical item" },
  { value: HelpRequestNeedKind.SERVICE, label: "Service" },
  { value: HelpRequestNeedKind.FINANCIAL, label: "Financial" },
]

export const VISIBILITY_OPTIONS: {
  value: VisibilityValue
  label: string
}[] = [
  { value: Visibility.PUBLIC, label: "Public" },
  { value: Visibility.PRIVATE, label: "Private" },
]

export const PRIORITY_LABELS: Record<PriorityLevelValue, string> =
  Object.fromEntries(
    PRIORITY_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<PriorityLevelValue, string>

export const STATUS_LABELS: Record<HelpRequestStatusValue, string> = {
  [HelpRequestStatus.ACTIVE]: "Active",
  [HelpRequestStatus.PARTIALLY_FULFILLED]: "Open",
  [HelpRequestStatus.FULFILLED]: "Fulfilled",
  [HelpRequestStatus.EXPIRED]: "Expired",
  [HelpRequestStatus.CANCELLED]: "Cancelled",
}
