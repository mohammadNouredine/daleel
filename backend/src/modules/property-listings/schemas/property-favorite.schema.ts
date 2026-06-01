import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'property_favorites' })
export class PropertyFavorite {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PropertyListing',
    required: true,
    index: true,
  })
  propertyId: Types.ObjectId;
}

export type PropertyFavoriteDocument = HydratedDocument<PropertyFavorite>;
export const PropertyFavoriteSchema =
  SchemaFactory.createForClass(PropertyFavorite);

PropertyFavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
