import { ListingContactMethod, LocationVisibility } from '../../common/enums';
import type { PropertyListingDocument } from './schemas/property-listing.schema';

export type PropertyListingResponse = {
  _id: string;
  ownerId: string;
  status: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  listingType: string;
  propertyType: string;
  title: string;
  description: string;
  images: PropertyListingDocument['images'];
  coverImage?: string;
  maxOccupancy?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingRooms?: number;
  parkingSpaces?: number;
  floorNumber?: number;
  buildingFloors?: number;
  area?: number;
  areaUnit?: string;
  furnishingStatus?: string;
  price?: number;
  currency?: string;
  pricePeriod?: string;
  requiredAdvanceMonths?: number;
  securityDeposit?: number;
  commissionAmount?: number;
  isPriceNegotiable: boolean;
  isEmergencyShelter: boolean;
  acceptFamilies: boolean;
  acceptChildren: boolean;
  acceptPets: boolean;
  womenOnly: boolean;
  menOnly: boolean;
  availableBeds?: number;
  totalBeds?: number;
  amenityIds: string[];
  location: PropertyListingDocument['location'];
  isAvailable: boolean;
  availableFrom?: string;
  availableUntil?: string;
  contactMethod: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  isVerified: boolean;
  publishedAt?: string;
  expiresAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MapPropertyListingOptions = {
  viewerId?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
};

export function mapPropertyListingToResponse(
  doc: PropertyListingDocument,
  options: MapPropertyListingOptions = {},
): PropertyListingResponse {
  const isOwner = options.isOwner ?? false;
  const isAdmin = options.isAdmin ?? false;
  const canSeePrivate = isOwner || isAdmin;

  const location = { ...doc.location };
  if (!canSeePrivate) {
    if (
      location.locationVisibility === LocationVisibility.HIDDEN ||
      location.locationVisibility === LocationVisibility.APPROXIMATE
    ) {
      delete location.coordinates;
    }
    if (location.locationVisibility === LocationVisibility.HIDDEN) {
      delete location.street;
    }
  }

  let contactPhone = doc.contactPhone;
  let contactWhatsapp = doc.contactWhatsapp;
  if (!canSeePrivate && doc.contactMethod === ListingContactMethod.PLATFORM_ONLY) {
    contactPhone = undefined;
    contactWhatsapp = undefined;
  }

  return {
    _id: doc._id.toHexString(),
    ownerId: doc.ownerId.toHexString(),
    status: doc.status,
    rejectionReason: doc.rejectionReason,
    reviewedBy: doc.reviewedBy?.toHexString(),
    reviewedAt: doc.reviewedAt?.toISOString(),
    listingType: doc.listingType,
    propertyType: doc.propertyType,
    title: doc.title,
    description: doc.description,
    images: doc.images ?? [],
    coverImage: doc.coverImage,
    maxOccupancy: doc.maxOccupancy,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    livingRooms: doc.livingRooms,
    parkingSpaces: doc.parkingSpaces,
    floorNumber: doc.floorNumber,
    buildingFloors: doc.buildingFloors,
    area: doc.area,
    areaUnit: doc.areaUnit,
    furnishingStatus: doc.furnishingStatus,
    price: doc.price,
    currency: doc.currency,
    pricePeriod: doc.pricePeriod,
    requiredAdvanceMonths: doc.requiredAdvanceMonths,
    securityDeposit: doc.securityDeposit,
    commissionAmount: doc.commissionAmount,
    isPriceNegotiable: doc.isPriceNegotiable,
    isEmergencyShelter: doc.isEmergencyShelter,
    acceptFamilies: doc.acceptFamilies,
    acceptChildren: doc.acceptChildren,
    acceptPets: doc.acceptPets,
    womenOnly: doc.womenOnly,
    menOnly: doc.menOnly,
    availableBeds: doc.availableBeds,
    totalBeds: doc.totalBeds,
    amenityIds: (doc.amenityIds ?? []).map((id) => id.toHexString()),
    location,
    isAvailable: doc.isAvailable,
    availableFrom: doc.availableFrom?.toISOString(),
    availableUntil: doc.availableUntil?.toISOString(),
    contactMethod: doc.contactMethod,
    contactPhone,
    contactWhatsapp,
    isVerified: doc.isVerified,
    publishedAt: doc.publishedAt?.toISOString(),
    expiresAt: doc.expiresAt?.toISOString(),
    archivedAt: doc.archivedAt?.toISOString(),
    createdAt:
      (doc.get('createdAt') as Date | undefined)?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (doc.get('updatedAt') as Date | undefined)?.toISOString() ??
      new Date().toISOString(),
  };
}
