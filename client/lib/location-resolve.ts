"use client"

import {
  fetchAddressPlaceSuggestions,
  fetchPlaceDetails,
  reverseGeocodeCoordinates,
  type PlaceSuggestion,
  type ResolvedLocation,
} from "./google-places-autocomplete"

export type { ResolvedLocation }

export { fetchAddressPlaceSuggestions, type PlaceSuggestion }

export async function resolveFromPlaceId(
  placeId: string
): Promise<ResolvedLocation | null> {
  const details = await fetchPlaceDetails(placeId)
  if (!details) return null

  const governorate = details.address.governorate?.trim() ?? ""
  const city = details.address.city?.trim() ?? ""

  if (!governorate || !city) {
    return null
  }

  return {
    formattedAddress: details.formattedAddress,
    placeId: details.placeId,
    latitude: details.latitude,
    longitude: details.longitude,
    governorate,
    city,
    street: details.address.street,
  }
}

export async function resolveFromCoordinates(
  lat: number,
  lng: number
): Promise<ResolvedLocation | null> {
  return reverseGeocodeCoordinates(lat, lng)
}
