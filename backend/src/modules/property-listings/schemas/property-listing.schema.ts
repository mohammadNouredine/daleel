import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AreaUnit,
  Currency,
  FurnishingStatus,
  ListingContactMethod,
  ListingType,
  LocationVisibility,
  PricePeriod,
  PropertyListingStatus,
  PropertyType,
} from '../../../common/enums';

@Schema({ _id: false })
export class ListingCoordinates {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;
}

export const ListingCoordinatesSchema =
  SchemaFactory.createForClass(ListingCoordinates);

@Schema({ _id: false })
export class ListingLocation {
  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true, trim: true })
  governorate: string;

  @Prop({ required: true, trim: true })
  district: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ trim: true })
  street?: string;

  @Prop({ type: ListingCoordinatesSchema })
  coordinates?: ListingCoordinates;

  @Prop({
    type: String,
    enum: LocationVisibility,
    default: LocationVisibility.APPROXIMATE,
  })
  locationVisibility: LocationVisibility;
}

export const ListingLocationSchema =
  SchemaFactory.createForClass(ListingLocation);

@Schema({ _id: false })
export class ListingImage {
  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ min: 0 })
  order?: number;
}

export const ListingImageSchema = SchemaFactory.createForClass(ListingImage);

@Schema({ timestamps: true, collection: 'property_listings' })
export class PropertyListing {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: PropertyListingStatus,
    default: PropertyListingStatus.DRAFT,
    index: true,
  })
  status: PropertyListingStatus;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'users', default: null })
  reviewedBy?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date | null;

  @Prop({ type: String, enum: ListingType, required: true, index: true })
  listingType: ListingType;

  @Prop({ type: String, enum: PropertyType, required: true })
  propertyType: PropertyType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [ListingImageSchema], default: [] })
  images: ListingImage[];

  @Prop({ trim: true })
  coverImage?: string;

  @Prop({ min: 1 })
  maxOccupancy?: number;

  @Prop({ min: 0 })
  bedrooms?: number;

  @Prop({ min: 0 })
  bathrooms?: number;

  @Prop({ min: 0 })
  livingRooms?: number;

  @Prop({ min: 0 })
  parkingSpaces?: number;

  @Prop()
  floorNumber?: number;

  @Prop({ min: 1 })
  buildingFloors?: number;

  @Prop({ min: 0 })
  area?: number;

  @Prop({ type: String, enum: AreaUnit })
  areaUnit?: AreaUnit;

  @Prop({ type: String, enum: FurnishingStatus })
  furnishingStatus?: FurnishingStatus;

  @Prop({ min: 0 })
  price?: number;

  @Prop({ type: String, enum: Currency })
  currency?: Currency;

  @Prop({ type: String, enum: PricePeriod })
  pricePeriod?: PricePeriod;

  @Prop({ min: 0 })
  requiredAdvanceMonths?: number;

  @Prop({ min: 0 })
  securityDeposit?: number;

  @Prop({ min: 0 })
  officeDeposit?: number;

  @Prop({ min: 0 })
  commissionAmount?: number;

  @Prop({ default: false })
  isPriceNegotiable: boolean;

  @Prop({ default: false })
  isEmergencyShelter: boolean;

  @Prop({ default: false })
  acceptFamilies: boolean;

  @Prop({ default: false })
  acceptChildren: boolean;

  @Prop({ default: false })
  acceptPets: boolean;

  @Prop({ default: false })
  womenOnly: boolean;

  @Prop({ default: false })
  menOnly: boolean;

  @Prop({ min: 0 })
  availableBeds?: number;

  @Prop({ min: 0 })
  totalBeds?: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Amenity' }], default: [] })
  amenityIds: Types.ObjectId[];

  @Prop({ type: ListingLocationSchema, required: true })
  location: ListingLocation;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: Date })
  availableFrom?: Date;

  @Prop({ type: Date })
  availableUntil?: Date;

  @Prop({
    type: String,
    enum: ListingContactMethod,
    default: ListingContactMethod.PLATFORM_ONLY,
  })
  contactMethod: ListingContactMethod;

  @Prop({ trim: true })
  contactPhone?: string;

  @Prop({ trim: true })
  contactWhatsapp?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Date })
  archivedAt?: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export type PropertyListingDocument = HydratedDocument<PropertyListing>;
export const PropertyListingSchema =
  SchemaFactory.createForClass(PropertyListing);

PropertyListingSchema.index({ ownerId: 1, status: 1 });
PropertyListingSchema.index({
  status: 1,
  listingType: 1,
  'location.governorate': 1,
  'location.city': 1,
});
PropertyListingSchema.index({ status: 1, price: 1 });
PropertyListingSchema.index({ status: 1, bedrooms: 1 });
PropertyListingSchema.index({ expiresAt: 1 });
PropertyListingSchema.index({ ownerId: 1, createdAt: -1 });
