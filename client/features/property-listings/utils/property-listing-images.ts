import type { PropertyListing } from "../types"
import { resolvePropertyListingMediaUrl } from "./build-property-listing-form-data"

export function getPropertyListingImageUrls(
  listing: PropertyListing
): string[] {
  const sorted = [...listing.images].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )

  const fromImages = sorted
    .map((image) => image.url?.trim())
    .filter((url): url is string => Boolean(url))
    .map(resolvePropertyListingMediaUrl)

  if (fromImages.length > 0) {
    return fromImages
  }

  if (listing.coverImage?.trim()) {
    return [resolvePropertyListingMediaUrl(listing.coverImage.trim())]
  }

  return []
}
