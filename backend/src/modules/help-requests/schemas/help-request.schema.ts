import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  HelpRequestApprovalStatus,
  HelpRequestStatus,
  HelpType,
  PriorityLevel,
  SubCategory,
  Visibility,
} from '../../../common/enums';

@Schema({ _id: false })
export class NeedLine {
  @Prop({ required: true, trim: true })
  id: string;

  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ required: true, min: 0 })
  required: number;

  @Prop({ default: 0, min: 0 })
  fulfilled: number;

  @Prop({ trim: true })
  unit?: string;

  @Prop({ required: true, trim: true })
  kind: string;

  @Prop({ trim: true })
  notes?: string;
}

export const NeedLineSchema = SchemaFactory.createForClass(NeedLine);

@Schema({ _id: false })
export class Coordinates {
  @Prop()
  lat: number;

  @Prop()
  lng: number;
}

export const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

@Schema({ _id: false })
export class RequestLocation {
  @Prop({ trim: true })
  governorate?: string;

  @Prop({ trim: true })
  district?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  street?: string;

  @Prop({ type: CoordinatesSchema })
  coordinates?: Coordinates;
}

export const RequestLocationSchema =
  SchemaFactory.createForClass(RequestLocation);

@Schema({ timestamps: true, collection: 'help_requests' })
export class HelpRequest {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: HelpType, required: true })
  helpType: HelpType;

  @Prop({ type: String, enum: SubCategory, required: true })
  subCategory: SubCategory;

  @Prop({
    type: String,
    enum: PriorityLevel,
    default: PriorityLevel.MEDIUM,
  })
  priorityLevel: PriorityLevel;

  @Prop({ type: [NeedLineSchema], default: [] })
  needs: NeedLine[];

  @Prop({ min: 1 })
  beneficiariesCount?: number;

  @Prop({ type: RequestLocationSchema })
  location?: RequestLocation;

  @Prop({ trim: true })
  contactPhone?: string;

  @Prop({ type: [String], default: [] })
  media: string[];

  @Prop({
    type: String,
    enum: HelpRequestStatus,
    default: HelpRequestStatus.ACTIVE,
  })
  status: HelpRequestStatus;

  @Prop({ type: String, enum: Visibility, default: Visibility.PUBLIC })
  visibility: Visibility;

  @Prop({
    type: String,
    enum: HelpRequestApprovalStatus,
    default: HelpRequestApprovalStatus.PENDING,
    index: true,
  })
  approvalStatus: HelpRequestApprovalStatus;

  @Prop({ trim: true })
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'users', default: null })
  reviewedBy?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date | null;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationNotes?: string;

  @Prop({ default: 0, min: 0 })
  reportsCount: number;

  @Prop({ default: 0, min: 0 })
  sharesCount: number;

  @Prop({ default: 0, min: 0 })
  viewsCount: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export type HelpRequestDocument = HydratedDocument<HelpRequest>;
export const HelpRequestSchema = SchemaFactory.createForClass(HelpRequest);

function deriveStatusFromNeeds(
  needs: NeedLine[],
  currentStatus: HelpRequestStatus,
): HelpRequestStatus {
  if (
    currentStatus === HelpRequestStatus.EXPIRED ||
    currentStatus === HelpRequestStatus.CANCELLED
  ) {
    return currentStatus;
  }

  if (needs.length === 0) {
    return HelpRequestStatus.ACTIVE;
  }

  const allFulfilled = needs.every((line) => line.fulfilled >= line.required);
  const hasPartial = needs.some(
    (line) => line.fulfilled > 0 && line.fulfilled < line.required,
  );
  const totalFulfilled = needs.reduce((sum, line) => sum + line.fulfilled, 0);

  if (allFulfilled) return HelpRequestStatus.FULFILLED;
  if (hasPartial || totalFulfilled > 0) {
    return HelpRequestStatus.PARTIALLY_FULFILLED;
  }
  return HelpRequestStatus.ACTIVE;
}

function normalizeNeedLines(needs: NeedLine[]): NeedLine[] {
  return needs.map((line) => {
    const required = Math.max(0, line.required);
    const fulfilled = Math.max(0, Math.min(required, line.fulfilled));
    return {
      id: line.id,
      kind: line.kind,
      label: line.label.trim(),
      required,
      fulfilled,
      unit: line.unit?.trim() || undefined,
      notes: line.notes?.trim() || undefined,
    };
  });
}

HelpRequestSchema.pre('save', function () {
  this.needs = normalizeNeedLines(this.needs ?? []);
  this.status = deriveStatusFromNeeds(this.needs, this.status);
});

HelpRequestSchema.index({ helpType: 1, subCategory: 1, status: 1 });
HelpRequestSchema.index({ approvalStatus: 1, deletedAt: 1, status: 1 });
HelpRequestSchema.index({
  'location.governorate': 1,
  'location.district': 1,
});
HelpRequestSchema.index({ expiresAt: 1 });
HelpRequestSchema.index({ createdBy: 1, status: 1 });
HelpRequestSchema.index({ deletedAt: 1 });
