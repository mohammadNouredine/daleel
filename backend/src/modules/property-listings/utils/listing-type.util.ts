import { ListingType } from '../../../common/enums';

export function isFreeListingType(listingType: ListingType): boolean {
  return (
    listingType === ListingType.SHELTER || listingType === ListingType.FREE_STAY
  );
}

export type ListingPricingFields = {
  price?: number;
  currency?: string;
  pricePeriod?: string;
  requiredAdvanceMonths?: number;
  securityDeposit?: number;
  officeDeposit?: number;
  commissionAmount?: number;
  isPriceNegotiable?: boolean;
};

export function clearPricingFields<T extends ListingPricingFields>(dto: T): T {
  return {
    ...dto,
    price: undefined,
    currency: undefined,
    pricePeriod: undefined,
    requiredAdvanceMonths: undefined,
    securityDeposit: undefined,
    officeDeposit: undefined,
    commissionAmount: undefined,
    isPriceNegotiable: false,
  };
}

export function applyListingTypePricingRules<
  T extends ListingPricingFields & { listingType: ListingType },
>(dto: T): T {
  if (!isFreeListingType(dto.listingType)) {
    return dto;
  }
  return clearPricingFields(dto);
}
