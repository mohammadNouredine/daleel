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

export const LEBANON_DISTRICTS_BY_GOVERNORATE: Record<string, string[]> = {
  Akkar: ["Akkar"],
  "Baalbek-Hermel": ["Baalbek", "Hermel"],
  Beirut: ["Beirut"],
  Bekaa: ["Rashaya", "West Bekaa", "Zahle"],
  "Mount Lebanon": [
    "Aley",
    "Baabda",
    "Chouf",
    "Jbeil",
    "Keserwan",
    "Matn",
  ],
  Nabatieh: ["Bint Jbeil", "Hasbaya", "Marjeyoun", "Nabatieh"],
  "North Lebanon": ["Batroun", "Bcharre", "Koura", "Miniyeh-Danniyeh", "Tripoli", "Zgharta"],
  "South Lebanon": ["Jezzine", "Saida", "Sour"],
}
