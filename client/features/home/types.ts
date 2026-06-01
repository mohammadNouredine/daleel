import type { LucideIcon } from "lucide-react"

export type HomeCategoryId =
  | "housing"
  | "shelter"
  | "medicine"
  | "food"
  | "rent"
  | "education"
  | "transportation"
  | "financial"
  | "baby"
  | "emergency"

export type HomeCategory = {
  id: HomeCategoryId
  label: string
  icon: LucideIcon
}

export type UrgentHelpRequestPreview = {
  id: string
  category: string
  categoryColor: "violet" | "orange" | "blue" | "emerald" | "rose"
  title: string
  location: string
  urgency: "Critical" | "High" | "Medium"
  raised: number
  goal: number
  currency: string
  authorName: string
  authorInitials: string
}

export type HousingListingPreview = {
  id: string
  title: string
  type: string
  location: string
  priceLabel: string
  isFree: boolean
  imageUrl: string
  beds?: number
  baths?: number
  areaSqm?: number
  capacity?: string
  amenities?: string[]
}

export type CommunityActivityItem = {
  id: string
  message: string
  timeAgo: string
}

export type TrustIndicator = {
  id: string
  label: string
  description: string
  icon: LucideIcon
}
