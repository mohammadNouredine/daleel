import { resolveFromCoordinates } from "@/lib/location-resolve"
import type { ResolveCoordinatesFn } from "@/features/help-requests/components/LocationMapPicker"

export const resolvePropertyMapCoordinates: ResolveCoordinatesFn = async (
  lat,
  lng
) => {
  const resolved = await resolveFromCoordinates(lat, lng)
  if (!resolved) {
    throw new Error(
      "Could not resolve this location. Try another point or search by address."
    )
  }

  return {
    governorate: resolved.governorate,
    district: "",
    city: resolved.city,
    street: resolved.street,
    formattedAddress: resolved.formattedAddress,
    placeId: resolved.placeId,
  }
}
