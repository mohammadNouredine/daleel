const PROPERTY_LISTINGS_BASE = "/api/v1/property-listings"
const AMENITIES_BASE = "/api/v1/amenities"
const PROPERTY_REPORTS_BASE = "/api/v1/property-reports"

export const PROPERTY_LISTINGS_LIST = PROPERTY_LISTINGS_BASE
export const PROPERTY_LISTINGS_LOCATION_FACETS = `${PROPERTY_LISTINGS_BASE}/location-facets`
export const PROPERTY_LISTINGS_MINE = `${PROPERTY_LISTINGS_BASE}/mine`
export const PROPERTY_LISTINGS_PENDING = `${PROPERTY_LISTINGS_BASE}/moderation/pending`
export const PROPERTY_LISTINGS_HIDDEN_MODERATION = `${PROPERTY_LISTINGS_BASE}/moderation/hidden`
export const PROPERTY_LISTINGS_ADMIN = `${PROPERTY_LISTINGS_BASE}/admin`
export const PROPERTY_LISTINGS_CREATE = PROPERTY_LISTINGS_BASE

export const AMENITIES_LIST = AMENITIES_BASE
export const PROPERTY_REPORTS_CREATE = PROPERTY_REPORTS_BASE

export const PROPERTY_LISTINGS_QUERY_KEY = ["property-listings"] as const
export const PROPERTY_LISTINGS_LOCATION_FACETS_QUERY_KEY = [
  "property-listings",
  "location-facets",
] as const
export const MY_PROPERTY_LISTINGS_QUERY_KEY = [
  "property-listings",
  "mine",
] as const
export const PENDING_PROPERTY_LISTINGS_QUERY_KEY = [
  "property-listings",
  "moderation",
  "pending",
] as const
export const HIDDEN_PROPERTY_LISTINGS_QUERY_KEY = [
  "property-listings",
  "moderation",
  "hidden",
] as const
export const ADMIN_PROPERTY_LISTINGS_QUERY_KEY = [
  "property-listings",
  "admin",
] as const
export const AMENITIES_QUERY_KEY = ["amenities"] as const

export function propertyListingDetailEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}`
}

export function propertyListingUpdateEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}`
}

export function propertyListingDeleteEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}`
}

export function propertyListingHideEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}/hide`
}

export function propertyListingUnhideEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}/unhide`
}

export function propertyListingFavoriteEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}/favorite`
}

export function propertyListingApproveEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}/approve`
}

export function propertyListingRejectEndpoint(id: string): string {
  return `${PROPERTY_LISTINGS_BASE}/${id}/reject`
}
