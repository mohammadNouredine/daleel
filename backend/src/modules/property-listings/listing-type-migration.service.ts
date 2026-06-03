import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListingType } from '../../common/enums';
import {
  PropertyListing,
  type PropertyListingDocument,
} from './schemas/property-listing.schema';

@Injectable()
export class ListingTypeMigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ListingTypeMigrationService.name);

  constructor(
    @InjectModel(PropertyListing.name)
    private readonly propertyListingModel: Model<PropertyListingDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const legacyRename = await this.propertyListingModel.updateMany(
      { listingType: 'TEMPORARY_HOUSING' as never },
      { $set: { listingType: ListingType.SHORT_TERM } },
    );

    if (legacyRename.modifiedCount > 0) {
      this.logger.log(
        `Migrated ${legacyRename.modifiedCount} listing(s) from TEMPORARY_HOUSING to SHORT_TERM.`,
      );
    }

    const shelterPricingCleanup = await this.propertyListingModel.updateMany(
      { listingType: ListingType.SHELTER },
      {
        $unset: {
          price: '',
          pricePeriod: '',
          currency: '',
          requiredAdvanceMonths: '',
          securityDeposit: '',
          officeDeposit: '',
          commissionAmount: '',
        },
        $set: { isPriceNegotiable: false },
      },
    );

    if (shelterPricingCleanup.modifiedCount > 0) {
      this.logger.log(
        `Cleared pricing on ${shelterPricingCleanup.modifiedCount} shelter listing(s).`,
      );
    }
  }
}
