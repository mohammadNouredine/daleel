import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AmenityCode } from '../../../common/enums';

@Schema({ timestamps: true, collection: 'amenities' })
export class Amenity {
  @Prop({
    type: String,
    enum: AmenityCode,
    required: true,
    unique: true,
  })
  code: AmenityCode;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export type AmenityDocument = HydratedDocument<Amenity>;
export const AmenitySchema = SchemaFactory.createForClass(Amenity);
