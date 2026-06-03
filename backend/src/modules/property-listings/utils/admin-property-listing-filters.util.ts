import { ListingType, PropertyListingStatus } from '../../../common/enums';
import { toObjectId } from '../../../common/utils/object-id.util';
import type { ListAdminPropertyListingsQueryDto } from '../dto/list-admin-property-listings-query.dto';

export function buildAdminPropertyListingFilter(
  query: ListAdminPropertyListingsQueryDto,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    deletedAt: null,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.listingType) {
    filter.listingType = query.listingType;
  }

  const search = query.q?.trim();
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: pattern }, { 'location.city': pattern }];
  }

  if (query.lastId) {
    filter._id = { $lt: toObjectId(query.lastId) };
  }

  return filter;
}

export type AdminPropertyListingSummary = {
  total: number;
  forRent: number;
  forSale: number;
  pendingApproval: number;
  hidden: number;
};

export async function countAdminPropertyListingSummary(
  model: {
    countDocuments: (filter: Record<string, unknown>) => Promise<number>;
  },
): Promise<AdminPropertyListingSummary> {
  const base = { deletedAt: null };

  const [total, forRent, forSale, pendingApproval, hidden] = await Promise.all([
    model.countDocuments(base),
    model.countDocuments({
      ...base,
      listingType: ListingType.RENT,
    }),
    model.countDocuments({
      ...base,
      listingType: ListingType.SALE,
    }),
    model.countDocuments({
      ...base,
      status: PropertyListingStatus.PENDING_APPROVAL,
    }),
    model.countDocuments({
      ...base,
      status: PropertyListingStatus.ARCHIVED,
    }),
  ]);

  return { total, forRent, forSale, pendingApproval, hidden };
}
