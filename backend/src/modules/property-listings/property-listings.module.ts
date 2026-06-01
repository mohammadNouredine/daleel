import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Amenity, AmenitySchema } from './schemas/amenity.schema';
import {
  PropertyFavorite,
  PropertyFavoriteSchema,
} from './schemas/property-favorite.schema';
import {
  PropertyListing,
  PropertyListingSchema,
} from './schemas/property-listing.schema';
import {
  PropertyReport,
  PropertyReportSchema,
} from './schemas/property-report.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from './schemas/subscription-plan.schema';

/**
 * Phase 1: schema registration only.
 * Next: APIs, moderation, favorites, subscription enforcement via User.currentPlanId.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyListing.name, schema: PropertyListingSchema },
      { name: Amenity.name, schema: AmenitySchema },
      { name: PropertyFavorite.name, schema: PropertyFavoriteSchema },
      { name: PropertyReport.name, schema: PropertyReportSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PropertyListingsModule {}
