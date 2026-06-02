import {
  LEBANON_DISTRICTS_BY_GOVERNORATE,
  LEBANON_GOVERNORATES,
} from "@/features/property-listings/constants"

function stripSuffix(value: string, suffix: RegExp): string {
  return value.replace(suffix, "").trim()
}

function caseInsensitiveEquals(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0
}

/** Map Nominatim / Google governorate strings to canonical form values. */
export function normalizeLebanonGovernorate(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""

  const canonical = LEBANON_GOVERNORATES.find((gov) =>
    caseInsensitiveEquals(gov, trimmed)
  )
  if (canonical) return canonical

  const cleaned = stripSuffix(trimmed, /\s+Governorate$/i)
  const fromCleaned = LEBANON_GOVERNORATES.find((gov) =>
    caseInsensitiveEquals(gov, cleaned)
  )
  if (fromCleaned) return fromCleaned

  const cleanedLower = cleaned.toLowerCase()
  const partial = LEBANON_GOVERNORATES.find((gov) => {
    const govLower = gov.toLowerCase()
    return (
      cleanedLower.includes(govLower) || govLower.includes(cleanedLower)
    )
  })
  return partial ?? trimmed
}

/** Map district strings (e.g. "Matn District") to values in our district lists. */
export function normalizeLebanonDistrict(
  raw: string,
  governorate: string
): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""

  const districts = LEBANON_DISTRICTS_BY_GOVERNORATE[governorate] ?? []
  if (districts.length === 0) {
    return stripSuffix(trimmed, /\s+District$/i)
  }

  const exact = districts.find((d) => caseInsensitiveEquals(d, trimmed))
  if (exact) return exact

  const cleaned = stripSuffix(trimmed, /\s+District$/i)
  const fromCleaned = districts.find((d) => caseInsensitiveEquals(d, cleaned))
  if (fromCleaned) return fromCleaned

  const cleanedLower = cleaned.toLowerCase()
  const partial = districts.find((d) => {
    const dLower = d.toLowerCase()
    return cleanedLower.includes(dLower) || dLower.includes(cleanedLower)
  })
  return partial ?? cleaned
}

export function normalizeLebanonLocationFields(fields: {
  governorate?: string
  district?: string
  city?: string
}): {
  governorate: string
  district: string
  city: string
} {
  const governorate = normalizeLebanonGovernorate(fields.governorate ?? "")
  const district = normalizeLebanonDistrict(
    fields.district ?? "",
    governorate
  )
  const city = (fields.city ?? "").trim()

  return { governorate, district, city }
}

export function isCanonicalLebanonGovernorate(value: string): boolean {
  return LEBANON_GOVERNORATES.includes(
    value as (typeof LEBANON_GOVERNORATES)[number]
  )
}
