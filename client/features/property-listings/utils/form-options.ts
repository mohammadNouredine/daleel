import {
  AreaUnit,
  Currency,
  FurnishingStatus,
  ListingContactMethod,
  ListingType,
  LocationVisibility,
  PricePeriod,
  PropertyType,
} from "../types"

function valuesToOptions<T extends Record<string, string>>(
  obj: T,
  labels?: Partial<Record<string, string>>
) {
  return Object.values(obj).map((value) => ({
    value,
    label: labels?.[value] ?? value.replace(/_/g, " "),
  }))
}

export const LISTING_TYPE_FORM_OPTIONS = valuesToOptions(ListingType, {
  RENT: "Rent",
  SALE: "Sale",
  SHELTER: "Shelter",
  TEMPORARY_HOUSING: "Temporary housing",
  ROOMMATE: "Roommate",
})

export const PROPERTY_TYPE_FORM_OPTIONS = valuesToOptions(PropertyType, {
  APARTMENT: "Apartment",
  HOUSE: "House",
  VILLA: "Villa",
  ROOM: "Room",
  STUDIO: "Studio",
  SHELTER: "Shelter",
  COMMERCIAL: "Commercial",
  LAND: "Land",
  BUILDING: "Building",
})

export const LOCATION_VISIBILITY_OPTIONS = valuesToOptions(LocationVisibility, {
  EXACT: "Exact address",
  APPROXIMATE: "Approximate area",
  HIDDEN: "Hidden until contact",
})

export const FURNISHING_FORM_OPTIONS = valuesToOptions(FurnishingStatus, {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi-furnished",
  UNFURNISHED: "Unfurnished",
})

export const CURRENCY_FORM_OPTIONS = valuesToOptions(Currency)

export const PRICE_PERIOD_FORM_OPTIONS = valuesToOptions(PricePeriod, {
  NIGHTLY: "Nightly",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
})

export const AREA_UNIT_FORM_OPTIONS = valuesToOptions(AreaUnit)

export const CONTACT_METHOD_FORM_OPTIONS = valuesToOptions(ListingContactMethod, {
  PHONE: "Phone",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  PLATFORM_ONLY: "Platform only",
})
