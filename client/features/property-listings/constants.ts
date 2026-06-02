export const DEFAULT_LISTING_COUNTRY = "Lebanon"

export const DEFAULT_PROPERTY_LISTING_PAGE_SIZE = 20

export const MAX_PROPERTY_LISTING_PAGE_SIZE = 50

export const MAX_PROPERTY_LISTING_IMAGES = 20

export const ACCEPTED_PROPERTY_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

/** Fallback when no listings loaded yet (filter governorate dropdown). */
export const LEBANON_GOVERNORATES = [
  "Akkar",
  "Baalbek-Hermel",
  "Beirut",
  "Bekaa",
  "Mount Lebanon",
  "Nabatieh",
  "North Lebanon",
  "South Lebanon",
] as const
