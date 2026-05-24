import {
  HelpRequestStatus,
  HelpType,
  PriorityLevel,
  SubCategory,
  Visibility,
  type HelpRequestStatusValue,
  type HelpTypeValue,
  type PriorityLevelValue,
  type SubCategoryValue,
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

export const HELP_TYPE_OPTIONS: { value: HelpTypeValue; label: string }[] = [
  { value: HelpType.MATERIAL, label: "Material" },
  { value: HelpType.FINANCIAL, label: "Financial" },
  { value: HelpType.MEDICAL, label: "Medical" },
  { value: HelpType.SHELTER, label: "Shelter" },
  { value: HelpType.TRANSPORT, label: "Transport" },
]

export const SUB_CATEGORY_OPTIONS: {
  value: SubCategoryValue
  label: string
}[] = [
  { value: SubCategory.FOOD, label: "Food" },
  { value: SubCategory.WATER, label: "Water" },
  { value: SubCategory.DIAPERS, label: "Diapers" },
  { value: SubCategory.MILK, label: "Milk" },
  { value: SubCategory.MEDICINE, label: "Medicine" },
  { value: SubCategory.BEDDING, label: "Bedding" },
  { value: SubCategory.CLOTHES, label: "Clothes" },
  { value: SubCategory.SURGERY, label: "Surgery" },
  { value: SubCategory.HOSPITAL, label: "Hospital" },
  { value: SubCategory.RENT, label: "Rent" },
  { value: SubCategory.FURNITURE_TRANSPORT, label: "Furniture / transport" },
]

export const PRIORITY_OPTIONS: {
  value: PriorityLevelValue
  label: string
}[] = [
  { value: PriorityLevel.LOW, label: "Low" },
  { value: PriorityLevel.MEDIUM, label: "Medium" },
  { value: PriorityLevel.HIGH, label: "High" },
  { value: PriorityLevel.CRITICAL, label: "Critical" },
]

export const VISIBILITY_OPTIONS: {
  value: VisibilityValue
  label: string
}[] = [
  { value: Visibility.PUBLIC, label: "Public" },
  { value: Visibility.PRIVATE, label: "Private" },
]

export const HELP_TYPE_LABELS: Record<HelpTypeValue, string> =
  Object.fromEntries(
    HELP_TYPE_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<HelpTypeValue, string>

export const SUB_CATEGORY_LABELS: Record<SubCategoryValue, string> =
  Object.fromEntries(
    SUB_CATEGORY_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<SubCategoryValue, string>

export const PRIORITY_LABELS: Record<PriorityLevelValue, string> =
  Object.fromEntries(
    PRIORITY_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<PriorityLevelValue, string>

export const STATUS_LABELS: Record<HelpRequestStatusValue, string> = {
  [HelpRequestStatus.ACTIVE]: "Active",
  [HelpRequestStatus.PARTIALLY_FULFILLED]: "Partially fulfilled",
  [HelpRequestStatus.FULFILLED]: "Fulfilled",
  [HelpRequestStatus.EXPIRED]: "Expired",
  [HelpRequestStatus.CANCELLED]: "Cancelled",
}
