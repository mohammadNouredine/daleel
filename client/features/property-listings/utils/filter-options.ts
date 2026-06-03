import {
  Currency,
  FurnishingStatus,
  ListingType,
  PropertyType,
} from "../types"

function enumToOptions<const T extends Record<string, string>>(
  obj: T,
  labels?: Partial<Record<string, string>>
) {
  return Object.values(obj).map((value) => ({
    value,
    label: labels?.[value] ?? value.replace(/_/g, " "),
  }))
}

export const LISTING_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  ...enumToOptions(ListingType, {
    RENT: "Rent",
    SALE: "Sale",
    SHELTER: "Shelter",
    SHORT_TERM: "Short term",
    ROOMMATE: "Roommate",
    FREE_STAY: "Free stay",
  }),
]

export const PROPERTY_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All properties" },
  ...enumToOptions(PropertyType),
]

export const FURNISHING_FILTER_OPTIONS = [
  { value: "all", label: "Any furnishing" },
  ...enumToOptions(FurnishingStatus, {
    FURNISHED: "Furnished",
    SEMI_FURNISHED: "Semi-furnished",
    UNFURNISHED: "Unfurnished",
  }),
]

export const CURRENCY_FILTER_OPTIONS = [
  { value: "all", label: "Any currency" },
  ...enumToOptions(Currency),
]

export const BEDROOM_FILTER_OPTIONS = [
  { value: "all", label: "Any bedrooms" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
]
