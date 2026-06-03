import {
  AreaUnit,
  Currency,
  FurnishingStatus,
  ListingContactMethod,
  ListingType,
  LocationVisibility,
  PricePeriod,
  PropertyType,
} from "../types";

function valuesToOptions<T extends Record<string, string>>(
  obj: T,
  labels?: Partial<Record<string, string>>,
) {
  return Object.values(obj).map((value) => ({
    value,
    label: labels?.[value] ?? value.replace(/_/g, " "),
  }));
}

export const LISTING_TYPE_FORM_OPTIONS = valuesToOptions(ListingType, {
  RENT: "Rent",
  SALE: "Sale",
  SHELTER: "Shelter",
  TEMPORARY_HOUSING: "Temporary housing",
  ROOMMATE: "Roommate",
});

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
});

export const LOCATION_VISIBILITY_OPTIONS = valuesToOptions(LocationVisibility, {
  EXACT: "Show exact location",
  APPROXIMATE: "Show approximate area",
  HIDDEN: "Hide location",
});

export const FURNISHING_FORM_OPTIONS = valuesToOptions(FurnishingStatus, {
  FURNISHED: "Furnished",
  SEMI_FURNISHED: "Semi-furnished",
  UNFURNISHED: "Unfurnished",
});

export const CURRENCY_FORM_OPTIONS = valuesToOptions(Currency);

export const PRICE_PERIOD_FORM_OPTIONS = valuesToOptions(PricePeriod, {
  NIGHTLY: "Nightly",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
})

/** Shown beside the Price label for rent / recurring listing types. */
export const PRICE_PERIOD_SUFFIX: Record<string, string> = {
  NIGHTLY: "/night",
  WEEKLY: "/week",
  MONTHLY: "/month",
  QUARTERLY: "/quarter",
  YEARLY: "/year",
}

export function getPriceFieldLightLabel(
  listingType: string,
  pricePeriod?: string
): string | undefined {
  const isRecurring =
    listingType === "RENT" ||
    listingType === "ROOMMATE" ||
    listingType === "TEMPORARY_HOUSING"

  if (!isRecurring || !pricePeriod) {
    return undefined
  }

  return PRICE_PERIOD_SUFFIX[pricePeriod]
};

export const AREA_UNIT_FORM_OPTIONS = valuesToOptions(AreaUnit);

export function getSelectOptionLabel(
  options: { value: string; label: string }[],
  value?: string,
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

export const CONTACT_METHOD_FORM_OPTIONS = valuesToOptions(
  ListingContactMethod,
  {
    PHONE: "Phone",
    WHATSAPP: "WhatsApp",
    EMAIL: "Email",
  },
).filter((option) => option.value !== ListingContactMethod.PLATFORM_ONLY);
