import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ReportStatus } from '../../../common/enums';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'reports',
})
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true, index: true })
  reportedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'HelpRequest', required: true })
  requestId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;
}

export type ReportDocument = HydratedDocument<Report>;
export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.index({ requestId: 1, status: 1 });
ReportSchema.index({ reportedBy: 1, requestId: 1 }, { unique: true });
