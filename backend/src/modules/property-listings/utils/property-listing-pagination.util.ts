import type { Model } from 'mongoose';
import type { PropertyListingDocument } from '../schemas/property-listing.schema';
import { resolveListingLimit } from './property-listing-filters.util';

export type PaginatedPropertyListingsResult<T> = {
  items: T[];
  nextLastId: string | null;
};

export async function paginatePropertyListings<T>(
  model: Model<PropertyListingDocument>,
  filter: Record<string, unknown>,
  limit: number | undefined,
  mapItem: (doc: PropertyListingDocument) => T,
): Promise<PaginatedPropertyListingsResult<T>> {
  const pageSize = resolveListingLimit(limit);
  const docs = await model
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(pageSize + 1)
    .exec();

  const hasMore = docs.length > pageSize;
  const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
  const items = pageDocs.map(mapItem);
  const nextLastId =
    hasMore && pageDocs.length > 0
      ? pageDocs[pageDocs.length - 1]._id.toHexString()
      : null;

  return { items, nextLastId };
}
