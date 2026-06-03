import { ListingType, type ListingTypeValue } from "../types"

export function isRecurringListingType(
  listingType: string
): listingType is ListingTypeValue {
  return (
    listingType === ListingType.RENT ||
    listingType === ListingType.ROOMMATE ||
    listingType === ListingType.SHORT_TERM
  )
}

export function isFreeListingType(
  listingType: string
): listingType is ListingTypeValue {
  return (
    listingType === ListingType.SHELTER ||
    listingType === ListingType.FREE_STAY
  )
}

export function shouldShowPricingSection(listingType: string): boolean {
  return !isFreeListingType(listingType)
}

export const LISTING_TYPE_DESCRIPTIONS: Partial<
  Record<ListingTypeValue, string>
> = {
  [ListingType.SHELTER]:
    "Communal or institutional space (school, center, etc.) — no fee.",
  [ListingType.FREE_STAY]:
    "A private home offered for free to help someone in need.",
  [ListingType.SHORT_TERM]:
    "Paid short-term stay (e.g. chalet, weekly rental).",
  [ListingType.RENT]: "Longer-term rental with recurring payment.",
  [ListingType.SALE]: "Property for sale.",
  [ListingType.ROOMMATE]: "Shared home with recurring payment.",
}

export function getListingTypeDescription(
  listingType: string
): string | undefined {
  return LISTING_TYPE_DESCRIPTIONS[listingType as ListingTypeValue]
}
