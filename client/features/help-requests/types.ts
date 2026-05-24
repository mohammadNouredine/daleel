export const HelpType = {
  MATERIAL: "MATERIAL",
  FINANCIAL: "FINANCIAL",
  MEDICAL: "MEDICAL",
  SHELTER: "SHELTER",
  TRANSPORT: "TRANSPORT",
} as const

export type HelpTypeValue = (typeof HelpType)[keyof typeof HelpType]

export const SubCategory = {
  FOOD: "FOOD",
  WATER: "WATER",
  DIAPERS: "DIAPERS",
  MILK: "MILK",
  MEDICINE: "MEDICINE",
  BEDDING: "BEDDING",
  CLOTHES: "CLOTHES",
  SURGERY: "SURGERY",
  HOSPITAL: "HOSPITAL",
  RENT: "RENT",
  FURNITURE_TRANSPORT: "FURNITURE_TRANSPORT",
} as const

export type SubCategoryValue = (typeof SubCategory)[keyof typeof SubCategory]

export const PriorityLevel = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const

export type PriorityLevelValue =
  (typeof PriorityLevel)[keyof typeof PriorityLevel]

export const HelpRequestStatus = {
  ACTIVE: "ACTIVE",
  PARTIALLY_FULFILLED: "PARTIALLY_FULFILLED",
  FULFILLED: "FULFILLED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const

export type HelpRequestStatusValue =
  (typeof HelpRequestStatus)[keyof typeof HelpRequestStatus]

export const Visibility = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const

export type VisibilityValue = (typeof Visibility)[keyof typeof Visibility]

export type HelpRequestQuantity = {
  required: number
  fulfilled: number
  remaining: number
  unit?: string
}

export type HelpRequestLocation = {
  governorate: string
  district: string
  city: string
  street?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export type HelpRequestFinancialDetails = {
  requiredAmount: number
  collectedAmount?: number
  currency: string
}

export type HelpRequest = {
  _id: string
  createdBy: string
  title: string
  description: string
  helpType: HelpTypeValue
  subCategory: SubCategoryValue
  priorityLevel: PriorityLevelValue
  quantity: HelpRequestQuantity
  beneficiariesCount?: number
  location: HelpRequestLocation
  status: HelpRequestStatusValue
  visibility: VisibilityValue
  isVerified: boolean
  media?: string[]
  financialDetails?: HelpRequestFinancialDetails
  createdAt: string
  updatedAt: string
}

export type CreateHelpRequestInput = {
  title: string
  description: string
  helpType: HelpTypeValue
  subCategory: SubCategoryValue
  priorityLevel: PriorityLevelValue
  quantity: {
    required: number
    unit?: string
  }
  beneficiariesCount?: number
  location: HelpRequestLocation
  visibility: VisibilityValue
  media?: string[]
  financialDetails?: HelpRequestFinancialDetails
}
