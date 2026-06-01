import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AmenitiesController } from './amenities.controller';
import { PropertyListingsController } from './property-listings.controller';
import { PropertyListingsService } from './property-listings.service';
import { PropertyReportsController } from './property-reports.controller';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyListing.name, schema: PropertyListingSchema },
      { name: Amenity.name, schema: AmenitySchema },
      { name: PropertyFavorite.name, schema: PropertyFavoriteSchema },
      { name: PropertyReport.name, schema: PropertyReportSchema },
      { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
    ]),
    UsersModule,
  ],
  controllers: [
    PropertyListingsController,
    AmenitiesController,
    PropertyReportsController,
  ],
  providers: [PropertyListingsService],
  exports: [MongooseModule, PropertyListingsService],
})
export class PropertyListingsModule {}
