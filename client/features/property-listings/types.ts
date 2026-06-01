export const ListingType = {
  RENT: "RENT",
  SALE: "SALE",
  SHELTER: "SHELTER",
  TEMPORARY_HOUSING: "TEMPORARY_HOUSING",
  ROOMMATE: "ROOMMATE",
} as const

export type ListingTypeValue = (typeof ListingType)[keyof typeof ListingType]

export const PropertyType = {
  APARTMENT: "APARTMENT",
  HOUSE: "HOUSE",
  VILLA: "VILLA",
  ROOM: "ROOM",
  STUDIO: "STUDIO",
  SHELTER: "SHELTER",
  COMMERCIAL: "COMMERCIAL",
  LAND: "LAND",
  BUILDING: "BUILDING",
} as const

export type PropertyTypeValue = (typeof PropertyType)[keyof typeof PropertyType]

export const PropertyListingStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
  EXPIRED: "EXPIRED",
  DELETED: "DELETED",
} as const

export type PropertyListingStatusValue =
  (typeof PropertyListingStatus)[keyof typeof PropertyListingStatus]

export const AreaUnit = {
  SQM: "SQM",
  SQFT: "SQFT",
} as const

export type AreaUnitValue = (typeof AreaUnit)[keyof typeof AreaUnit]

export const FurnishingStatus = {
  FURNISHED: "FURNISHED",
  SEMI_FURNISHED: "SEMI_FURNISHED",
  UNFURNISHED: "UNFURNISHED",
} as const

export type FurnishingStatusValue =
  (typeof FurnishingStatus)[keyof typeof FurnishingStatus]

export const Currency = {
  USD: "USD",
  LBP: "LBP",
} as const

export type CurrencyValue = (typeof Currency)[keyof typeof Currency]

export const PricePeriod = {
  NIGHTLY: "NIGHTLY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
} as const

export type PricePeriodValue = (typeof PricePeriod)[keyof typeof PricePeriod]

export const LocationVisibility = {
  EXACT: "EXACT",
  APPROXIMATE: "APPROXIMATE",
  HIDDEN: "HIDDEN",
} as const

export type LocationVisibilityValue =
  (typeof LocationVisibility)[keyof typeof LocationVisibility]

export const ListingContactMethod = {
  PHONE: "PHONE",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  PLATFORM_ONLY: "PLATFORM_ONLY",
} as const

export type ListingContactMethodValue =
  (typeof ListingContactMethod)[keyof typeof ListingContactMethod]

export type ListingCoordinates = {
  lat: number
  lng: number
}

export type ListingLocation = {
  country: string
  governorate: string
  district: string
  city: string
  street?: string
  coordinates?: ListingCoordinates
  locationVisibility: LocationVisibilityValue
}

export type ListingImage = {
  url: string
  order?: number
}

export type PropertyListing = {
  _id: string
  ownerId: string
  status: PropertyListingStatusValue
  rejectionReason?: string
  reviewedBy?: string
  reviewedAt?: string
  listingType: ListingTypeValue
  propertyType: PropertyTypeValue
  title: string
  description: string
  images: ListingImage[]
  coverImage?: string
  maxOccupancy?: number
  bedrooms?: number
  bathrooms?: number
  livingRooms?: number
  parkingSpaces?: number
  floorNumber?: number
  buildingFloors?: number
  area?: number
  areaUnit?: AreaUnitValue
  furnishingStatus?: FurnishingStatusValue
  price?: number
  currency?: CurrencyValue
  pricePeriod?: PricePeriodValue
  requiredAdvanceMonths?: number
  securityDeposit?: number
  commissionAmount?: number
  isPriceNegotiable: boolean
  isEmergencyShelter: boolean
  acceptFamilies: boolean
  acceptChildren: boolean
  acceptPets: boolean
  womenOnly: boolean
  menOnly: boolean
  availableBeds?: number
  totalBeds?: number
  amenityIds: string[]
  location: ListingLocation
  isAvailable: boolean
  availableFrom?: string
  availableUntil?: string
  contactMethod: ListingContactMethodValue
  contactPhone?: string
  contactWhatsapp?: string
  isVerified: boolean
  publishedAt?: string
  expiresAt?: string
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export type PropertyListingPaginatedResponse = {
  items: PropertyListing[]
  nextLastId: string | null
}

export type Amenity = {
  _id: string
  code: string
  isActive: boolean
  sortOrder: number
}

export type CreatePropertyListingInput = {
  listingType: ListingTypeValue
  propertyType: PropertyTypeValue
  title: string
  description: string
  location: ListingLocation
  images?: ListingImage[]
  coverImage?: string
  existingImages?: string[]
  maxOccupancy?: number
  bedrooms?: number
  bathrooms?: number
  livingRooms?: number
  parkingSpaces?: number
  floorNumber?: number
  buildingFloors?: number
  area?: number
  areaUnit?: AreaUnitValue
  furnishingStatus?: FurnishingStatusValue
  price?: number
  currency?: CurrencyValue
  pricePeriod?: PricePeriodValue
  requiredAdvanceMonths?: number
  securityDeposit?: number
  commissionAmount?: number
  isPriceNegotiable?: boolean
  isEmergencyShelter?: boolean
  acceptFamilies?: boolean
  acceptChildren?: boolean
  acceptPets?: boolean
  womenOnly?: boolean
  menOnly?: boolean
  availableBeds?: number
  totalBeds?: number
  amenityIds?: string[]
  isAvailable?: boolean
  availableFrom?: string
  availableUntil?: string
  contactMethod?: ListingContactMethodValue
  contactPhone?: string
  contactWhatsapp?: string
  saveAsDraft?: boolean
}

export type CreatePropertyReportInput = {
  propertyId: string
  reason: string
  description?: string
}

export type CreatePropertyReportResponse = {
  _id: string
}

export type FavoritePropertyListingResponse = {
  favorited: boolean
}
