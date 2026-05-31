import type { HelpRequestSortValue } from "../types"

export const DEFAULT_HELP_REQUEST_SORT: HelpRequestSortValue = "latest"

export function buildHelpRequestSortParams(
  sort: HelpRequestSortValue,
  coords: { lat: number; lng: number } | null
): {
  sort: HelpRequestSortValue
  lat?: number
  lng?: number
} {
  if (sort === "nearest" && coords) {
    return { sort, lat: coords.lat, lng: coords.lng }
  }

  return { sort: sort === "nearest" ? "latest" : sort }
}
