import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReportStatus } from '../../../common/enums';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'property_reports',
})
export class PropertyReport {
  @Prop({
    type: Types.ObjectId,
    ref: 'PropertyListing',
    required: true,
    index: true,
  })
  propertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true, index: true })
  reportedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;
}

export type PropertyReportDocument = HydratedDocument<PropertyReport>;
export const PropertyReportSchema =
  SchemaFactory.createForClass(PropertyReport);

PropertyReportSchema.index({ propertyId: 1, status: 1 });
PropertyReportSchema.index({ reportedBy: 1, propertyId: 1 }, { unique: true });
