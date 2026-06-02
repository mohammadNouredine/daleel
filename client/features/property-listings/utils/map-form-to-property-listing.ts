import type {
  AreaUnitValue,
  CreatePropertyListingInput,
  CurrencyValue,
  FurnishingStatusValue,
  ListingContactMethodValue,
  ListingLocation,
  ListingTypeValue,
  LocationVisibilityValue,
  PricePeriodValue,
  PropertyListing,
  PropertyTypeValue,
} from "../types"
import {
  formatContactPhone,
  splitContactPhone,
} from "@/components/forms/Phone/phone-utils"
import { DEFAULT_LISTING_COUNTRY } from "../constants"
import type { CreatePropertyListingFormValues } from "../schemas/create-property-listing.schema"

function parseOptionalInt(value?: string): number | undefined {
  if (!value?.trim()) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function parseOptionalFloat(value?: string): number | undefined {
  if (!value?.trim()) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function buildLocationFromForm(
  values: CreatePropertyListingFormValues
): ListingLocation {
  const lat = parseOptionalFloat(values.latitude)
  const lng = parseOptionalFloat(values.longitude)

  return {
    country: DEFAULT_LISTING_COUNTRY,
    governorate: values.governorate.trim(),
    district: values.district.trim(),
    city: values.city.trim(),
    street: values.street?.trim() || undefined,
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    locationVisibility: values.locationVisibility as LocationVisibilityValue,
  }
}

export function mapFormToCreatePropertyListingInput(
  values: CreatePropertyListingFormValues
): CreatePropertyListingInput {
  return {
    listingType: values.listingType as ListingTypeValue,
    propertyType: values.propertyType as PropertyTypeValue,
    title: values.title.trim(),
    description: values.description.trim(),
    location: buildLocationFromForm(values),
    maxOccupancy: parseOptionalInt(values.maxOccupancy),
    bedrooms: parseOptionalInt(values.bedrooms),
    bathrooms: parseOptionalInt(values.bathrooms),
    livingRooms: parseOptionalInt(values.livingRooms),
    parkingSpaces: parseOptionalInt(values.parkingSpaces),
    floorNumber: parseOptionalFloat(values.floorNumber),
    buildingFloors: parseOptionalInt(values.buildingFloors),
    area: parseOptionalFloat(values.area),
    areaUnit: values.areaUnit as AreaUnitValue | undefined,
    furnishingStatus: values.furnishingStatus as
      | FurnishingStatusValue
      | undefined,
    price: parseOptionalFloat(values.price),
    currency: values.currency as CurrencyValue | undefined,
    pricePeriod: values.pricePeriod as PricePeriodValue | undefined,
    requiredAdvanceMonths: parseOptionalInt(values.requiredAdvanceMonths),
    securityDeposit: parseOptionalFloat(values.securityDeposit),
    officeDeposit: parseOptionalFloat(values.officeDeposit),
    commissionAmount: parseOptionalFloat(values.commissionAmount),
    isPriceNegotiable: values.isPriceNegotiable,
    isEmergencyShelter: values.isEmergencyShelter,
    acceptFamilies: values.acceptFamilies,
    acceptChildren: values.acceptChildren,
    acceptPets: values.acceptPets,
    womenOnly: values.womenOnly,
    menOnly: values.menOnly,
    availableBeds: parseOptionalInt(values.availableBeds),
    totalBeds: parseOptionalInt(values.totalBeds),
    amenityIds: values.amenityIds,
    isAvailable: values.isAvailable,
    availableFrom: values.availableFrom || undefined,
    availableUntil: values.availableUntil || undefined,
    contactMethod: values.contactMethod as ListingContactMethodValue | undefined,
    contactPhone: formatContactPhone(values.phoneCode, values.phoneNumber),
    contactWhatsapp: values.contactWhatsapp?.trim() || undefined,
    saveAsDraft: values.saveAsDraft,
  }
}

export function mapPropertyListingToFormValues(
  listing: PropertyListing
): CreatePropertyListingFormValues {
  const phone = splitContactPhone(listing.contactPhone)

  return {
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    title: listing.title,
    description: listing.description,
    country: listing.location.country,
    governorate: listing.location.governorate,
    district: listing.location.district,
    city: listing.location.city,
    street: listing.location.street ?? "",
    latitude: listing.location.coordinates?.lat
      ? String(listing.location.coordinates.lat)
      : "",
    longitude: listing.location.coordinates?.lng
      ? String(listing.location.coordinates.lng)
      : "",
    locationVisibility: listing.location.locationVisibility,
    maxOccupancy: listing.maxOccupancy ? String(listing.maxOccupancy) : "",
    bedrooms: listing.bedrooms !== undefined ? String(listing.bedrooms) : "",
    bathrooms:
      listing.bathrooms !== undefined ? String(listing.bathrooms) : "",
    livingRooms:
      listing.livingRooms !== undefined ? String(listing.livingRooms) : "",
    parkingSpaces:
      listing.parkingSpaces !== undefined
        ? String(listing.parkingSpaces)
        : "",
    floorNumber:
      listing.floorNumber !== undefined ? String(listing.floorNumber) : "",
    buildingFloors:
      listing.buildingFloors !== undefined
        ? String(listing.buildingFloors)
        : "",
    area: listing.area !== undefined ? String(listing.area) : "",
    areaUnit: listing.areaUnit ?? "SQM",
    furnishingStatus: listing.furnishingStatus,
    price: listing.price !== undefined ? String(listing.price) : "",
    currency: listing.currency ?? "USD",
    pricePeriod: listing.pricePeriod ?? "MONTHLY",
    requiredAdvanceMonths: listing.requiredAdvanceMonths
      ? String(listing.requiredAdvanceMonths)
      : "",
    securityDeposit:
      listing.securityDeposit !== undefined
        ? String(listing.securityDeposit)
        : "",
    officeDeposit:
      listing.officeDeposit !== undefined ? String(listing.officeDeposit) : "",
    commissionAmount:
      listing.commissionAmount !== undefined
        ? String(listing.commissionAmount)
        : "",
    isPriceNegotiable: listing.isPriceNegotiable,
    isEmergencyShelter: listing.isEmergencyShelter,
    acceptFamilies: listing.acceptFamilies,
    acceptChildren: listing.acceptChildren,
    acceptPets: listing.acceptPets,
    womenOnly: listing.womenOnly,
    menOnly: listing.menOnly,
    availableBeds:
      listing.availableBeds !== undefined ? String(listing.availableBeds) : "",
    totalBeds:
      listing.totalBeds !== undefined ? String(listing.totalBeds) : "",
    amenityIds: listing.amenityIds,
    isAvailable: listing.isAvailable,
    availableFrom: listing.availableFrom ?? "",
    availableUntil: listing.availableUntil ?? "",
    contactMethod: listing.contactMethod,
    phoneCode: phone.phoneCode,
    phoneNumber: phone.phoneNumber,
    contactWhatsapp: listing.contactWhatsapp ?? "",
    imageUrls: listing.images.map((img) => img.url),
    imageFiles: [],
    saveAsDraft: listing.status === "DRAFT",
  }
}
