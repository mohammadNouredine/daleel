import { PropertyListingStatus } from '../../../common/enums';
import type { ListPropertyListingsQueryDto } from '../dto/list-property-listings-query.dto';
import { toObjectId } from '../../../common/utils/object-id.util';

export type PropertyListingFilterOptions = {
  ownerId?: string;
  publicFeed?: boolean;
};

export function buildPropertyListingFilter(
  query: ListPropertyListingsQueryDto,
  options: PropertyListingFilterOptions = {},
): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    deletedAt: null,
  };

  if (options.ownerId) {
    filter.ownerId = toObjectId(options.ownerId);
  }

  if (options.publicFeed) {
    filter.status = PropertyListingStatus.APPROVED;
    if (query.isAvailable === undefined) {
      filter.isAvailable = true;
    }
  }

  if (query.listingType) {
    filter.listingType = query.listingType;
  }

  if (query.propertyType) {
    filter.propertyType = query.propertyType;
  }

  if (query.governorate && query.governorate !== 'all') {
    filter['location.governorate'] = query.governorate;
  }

  if (query.city && query.city !== 'all') {
    filter['location.city'] = query.city;
  }

  if (query.district && query.district !== 'all') {
    filter['location.district'] = query.district;
  }

  if (query.currency) {
    filter.currency = query.currency;
  }

  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.priceMin !== undefined) {
      priceFilter.$gte = query.priceMin;
    }
    if (query.priceMax !== undefined) {
      priceFilter.$lte = query.priceMax;
    }
    filter.price = priceFilter;
  }

  if (query.areaMin !== undefined || query.areaMax !== undefined) {
    const areaFilter: Record<string, number> = {};
    if (query.areaMin !== undefined) {
      areaFilter.$gte = query.areaMin;
    }
    if (query.areaMax !== undefined) {
      areaFilter.$lte = query.areaMax;
    }
    filter.area = areaFilter;
  }

  if (query.bedrooms !== undefined) {
    filter.bedrooms = { $gte: query.bedrooms };
  }

  if (query.bathrooms !== undefined) {
    filter.bathrooms = { $gte: query.bathrooms };
  }

  if (query.furnishingStatus) {
    filter.furnishingStatus = query.furnishingStatus;
  }

  if (query.isEmergencyShelter === true) {
    filter.isEmergencyShelter = true;
  }

  if (query.acceptFamilies === true) {
    filter.acceptFamilies = true;
  }

  if (query.acceptChildren === true) {
    filter.acceptChildren = true;
  }

  if (query.acceptPets === true) {
    filter.acceptPets = true;
  }

  if (query.womenOnly === true) {
    filter.womenOnly = true;
  }

  if (query.menOnly === true) {
    filter.menOnly = true;
  }

  if (query.isVerified === true) {
    filter.isVerified = true;
  }

  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable;
  }

  if (query.amenityIds?.length) {
    filter.amenityIds = {
      $all: query.amenityIds.map((id) => toObjectId(id)),
    };
  }

  if (query.lastId) {
    filter._id = { $lt: toObjectId(query.lastId) };
  }

  return filter;
}

export function resolveListingLimit(limit?: number): number {
  const DEFAULT = 20;
  const MAX = 50;
  if (limit === undefined) {
    return DEFAULT;
  }
  return Math.min(Math.max(1, limit), MAX);
}
