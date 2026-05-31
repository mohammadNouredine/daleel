import type { HelpRequestLocation } from "../types"

export function formatHelpRequestLocationLabel(
  location?: HelpRequestLocation | null,
): string | null {
  if (!location) return null

  const label = [location.city, location.district, location.governorate, location.street]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ")

  return label || null
}

export function hasHelpRequestLocation(
  location?: HelpRequestLocation | null,
): boolean {
  return formatHelpRequestLocationLabel(location) !== null
}

export function buildLocationFromFormFields(values: {
  governorate?: string
  district?: string
  city?: string
  street?: string
  latitude?: string
  longitude?: string
}): HelpRequestLocation | undefined {
  const governorate = values.governorate?.trim() ?? ""
  const district = values.district?.trim() ?? ""
  const city = values.city?.trim() ?? ""
  const street = values.street?.trim()
  const lat = values.latitude?.trim() ? Number(values.latitude) : undefined
  const lng = values.longitude?.trim() ? Number(values.longitude) : undefined

  const coordinates =
    lat !== undefined &&
    lng !== undefined &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
      ? { lat, lng }
      : undefined

  if (!governorate && !district && !city && !street && !coordinates) {
    return undefined
  }

  return {
    governorate,
    district,
    city,
    street: street || undefined,
    coordinates,
  }
}
