"use client"

import { loadGooglePlacesApi } from "./google-places-loader"

export type ResolvedLocation = {
  formattedAddress: string
  placeId?: string
  latitude: number
  longitude: number
  governorate: string
  city: string
  street?: string
}

export type PlaceSuggestion = {
  placeId: string
  description: string
}

export type PlaceSelection = {
  placeId: string
  formattedAddress: string
  latitude: number
  longitude: number
  address: {
    governorate?: string
    district?: string
    city?: string
    street?: string
  }
}

type GoogleAddressComponent = {
  types?: string[]
  long_name?: string
}

type GooglePlaceResult = {
  place_id?: string
  formatted_address?: string
  types?: string[]
  geometry?: {
    location?: { lat: () => number; lng: () => number }
    location_type?: string
  }
  address_components?: GoogleAddressComponent[]
}

function isCountryOnlyGeocodeResult(result: GooglePlaceResult): boolean {
  const types = result.types ?? []
  return (
    types.length > 0 &&
    types.every((type) => type === "country" || type === "political")
  )
}

function resolveCityFromComponents(
  address: ReturnType<typeof extractAddressComponents>,
  formattedAddress: string
): string {
  const direct =
    address.city?.trim() ??
    address.district?.trim() ??
    ""
  if (direct) return direct

  const parts = formattedAddress
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part.toLowerCase() !== "lebanon")

  return parts[0] ?? ""
}

function resolveGovernorateFromComponents(
  address: ReturnType<typeof extractAddressComponents>,
  formattedAddress: string
): string {
  const direct = address.governorate?.trim() ?? ""
  if (direct) return direct

  const parts = formattedAddress
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part.toLowerCase() !== "lebanon")

  return parts.find((part) => /governorate/i.test(part)) ?? parts[parts.length - 1] ?? ""
}

function scoreGeocodeResult(result: GooglePlaceResult): number {
  if (isCountryOnlyGeocodeResult(result)) {
    return -1
  }

  const address = extractAddressComponents(result.address_components ?? [])
  const formattedAddress = result.formatted_address?.trim() ?? ""
  const governorate = resolveGovernorateFromComponents(address, formattedAddress)
  const city = resolveCityFromComponents(address, formattedAddress)

  let score = 0
  if (governorate) score += 20
  if (city) score += 20
  if (address.street) score += 10

  const types = result.types ?? []
  if (types.some((t) => t === "street_address" || t === "premise")) score += 15
  if (types.some((t) => t === "route" || t === "neighborhood")) score += 10
  if (types.some((t) => t === "locality" || t === "sublocality")) score += 8
  if (types.some((t) => t === "administrative_area_level_2")) score += 5

  const locationType = result.geometry?.location_type
  if (locationType === "ROOFTOP" || locationType === "RANGE_INTERPOLATED") {
    score += 5
  }

  return score
}

function pickBestGeocodeResult(
  results: GooglePlaceResult[] | null | undefined
): GooglePlaceResult | null {
  if (!results?.length) return null

  let best: GooglePlaceResult | null = null
  let bestScore = -1

  for (const result of results) {
    const score = scoreGeocodeResult(result)
    if (score > bestScore) {
      bestScore = score
      best = result
    }
  }

  return bestScore >= 0 ? best : null
}

function mapGeocodeResultToResolved(
  result: GooglePlaceResult,
  lat: number,
  lng: number
): ResolvedLocation | null {
  const formattedAddress = result.formatted_address?.trim()
  if (!formattedAddress || isCountryOnlyGeocodeResult(result)) {
    return null
  }

  const address = extractAddressComponents(result.address_components ?? [])
  const governorate = resolveGovernorateFromComponents(address, formattedAddress)
  const city = resolveCityFromComponents(address, formattedAddress)

  if (!governorate || !city) {
    return null
  }

  return {
    formattedAddress,
    placeId: result.place_id,
    latitude: lat,
    longitude: lng,
    governorate,
    city,
    street: address.street || undefined,
  }
}

export function extractAddressComponents(components: GoogleAddressComponent[]) {
  const byType = (type: string) =>
    components.find((c) => (c.types ?? []).includes(type))?.long_name

  const city =
    byType("locality") ??
    byType("sublocality") ??
    byType("administrative_area_level_3") ??
    byType("administrative_area_level_2")

  return {
    governorate: byType("administrative_area_level_1"),
    district: byType("administrative_area_level_2"),
    city,
    street: [byType("route"), byType("street_number")].filter(Boolean).join(" "),
  }
}

function mapPlaceResultToSelection(
  placeId: string,
  result: GooglePlaceResult
): PlaceSelection | null {
  const location = result.geometry?.location
  if (!location) return null

  const formattedAddress = result.formatted_address?.trim()
  if (!formattedAddress) return null

  return {
    placeId,
    formattedAddress,
    latitude: location.lat(),
    longitude: location.lng(),
    address: extractAddressComponents(result.address_components ?? []),
  }
}

export async function fetchAddressPlaceSuggestions(
  input: string
): Promise<PlaceSuggestion[]> {
  if (!input.trim()) return []
  const google = await loadGooglePlacesApi()
  const service = new google.maps.places.AutocompleteService()

  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "lb" },
        types: ["geocode"],
      },
      (predictions: { place_id: string; description: string }[] | null, status: string) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          resolve([])
          return
        }
        resolve(
          predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
          }))
        )
      }
    )
  })
}

export async function fetchPlaceDetails(
  placeId: string
): Promise<PlaceSelection | null> {
  const google = await loadGooglePlacesApi()
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  )

  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ["formatted_address", "geometry", "address_components"],
      },
      (result: GooglePlaceResult | null, status: string) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
          resolve(null)
          return
        }
        resolve(mapPlaceResultToSelection(placeId, result))
      }
    )
  })
}

function geocodeAtCoordinates(
  geocoder: { geocode: (...args: unknown[]) => void },
  google: { maps: { GeocoderStatus: { OK: string } } },
  lat: number,
  lng: number,
  request: Record<string, unknown>
): Promise<GooglePlaceResult[] | null> {
  return new Promise((resolve) => {
    geocoder.geocode(
      { location: { lat, lng }, ...request },
      (results: GooglePlaceResult[] | null, status: string) => {
        if (status !== google.maps.GeocoderStatus.OK || !results?.length) {
          resolve(null)
          return
        }
        resolve(results)
      }
    )
  })
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<ResolvedLocation | null> {
  const google = await loadGooglePlacesApi()
  const geocoder = new google.maps.Geocoder()

  const attempts: Record<string, unknown>[] = [
    { language: "en", region: "lb" },
    {
      language: "en",
      region: "lb",
      result_type: [
        "street_address",
        "route",
        "neighborhood",
        "locality",
        "administrative_area_level_3",
        "administrative_area_level_2",
        "administrative_area_level_1",
      ],
    },
  ]

  for (const request of attempts) {
    const results = await geocodeAtCoordinates(geocoder, google, lat, lng, request)
    const best = pickBestGeocodeResult(results)
    if (!best) continue

    const resolved = mapGeocodeResultToResolved(best, lat, lng)
    if (resolved) return resolved
  }

  return null
}

/** @deprecated Use fetchAddressPlaceSuggestions for property listings */
export async function fetchPlaceSuggestions(
  input: string
): Promise<PlaceSuggestion[]> {
  return fetchAddressPlaceSuggestions(input)
}
