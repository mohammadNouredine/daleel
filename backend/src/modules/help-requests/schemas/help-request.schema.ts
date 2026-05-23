import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  HelpRequestStatus,
  HelpType,
  PriorityLevel,
  SubCategory,
  Visibility,
} from '../../../common/enums';

@Schema({ _id: false })
export class Quantity {
  @Prop({ required: true, min: 0 })
  required: number;

  @Prop({ default: 0, min: 0 })
  fulfilled: number;

  @Prop({ default: 0, min: 0 })
  remaining: number;

  @Prop({ trim: true })
  unit: string;
}

export const QuantitySchema = SchemaFactory.createForClass(Quantity);

@Schema({ _id: false })
export class SpecialCases {
  @Prop({ default: false })
  hasChildren: boolean;

  @Prop({ default: false })
  hasElderly: boolean;

  @Prop({ default: false })
  hasDisabled: boolean;

  @Prop({ default: false })
  hasChronicDisease: boolean;
}

export const SpecialCasesSchema = SchemaFactory.createForClass(SpecialCases);

@Schema({ _id: false })
export class MedicalDetails {
  @Prop()
  hospitalName: string;

  @Prop()
  operationType: string;

  @Prop()
  deadlineDate: Date;
}

export const MedicalDetailsSchema =
  SchemaFactory.createForClass(MedicalDetails);

@Schema({ _id: false })
export class FinancialDetails {
  @Prop({ min: 0 })
  requiredAmount: number;

  @Prop({ default: 0, min: 0 })
  collectedAmount: number;

  @Prop({ default: 'USD' })
  currency: string;
}

export const FinancialDetailsSchema =
  SchemaFactory.createForClass(FinancialDetails);

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
  @Prop()
  governorate: string;

  @Prop()
  district: string;

  @Prop()
  city: string;

  @Prop()
  street: string;

  @Prop({ type: CoordinatesSchema })
  coordinates: Coordinates;
}

export const RequestLocationSchema =
  SchemaFactory.createForClass(RequestLocation);

@Schema({ _id: false })
export class ContactInfo {
  @Prop()
  phone: string;

  @Prop()
  whatsapp: string;
}

export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);

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

  @Prop({ type: QuantitySchema, required: true })
  quantity: Quantity;

  @Prop({ min: 1 })
  beneficiariesCount: number;

  @Prop({ type: SpecialCasesSchema, default: () => ({}) })
  specialCases: SpecialCases;

  @Prop({ type: MedicalDetailsSchema })
  medicalDetails: MedicalDetails;

  @Prop({ type: FinancialDetailsSchema })
  financialDetails: FinancialDetails;

  @Prop({ type: RequestLocationSchema, required: true })
  location: RequestLocation;

  @Prop({ type: ContactInfoSchema })
  contactInfo: ContactInfo;

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

  @Prop()
  expiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationNotes: string;

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

function syncQuantityAndStatus(doc: HelpRequestDocument): void {
  if (!doc.quantity) return;

  const { required, fulfilled } = doc.quantity;
  doc.quantity.remaining = Math.max(0, required - fulfilled);

  if (
    doc.status !== HelpRequestStatus.EXPIRED &&
    doc.status !== HelpRequestStatus.CANCELLED
  ) {
    if (fulfilled >= required && required > 0) {
      doc.status = HelpRequestStatus.FULFILLED;
    } else if (fulfilled > 0) {
      doc.status = HelpRequestStatus.PARTIALLY_FULFILLED;
    } else if (doc.status === HelpRequestStatus.PARTIALLY_FULFILLED) {
      doc.status = HelpRequestStatus.ACTIVE;
    }
  }
}

HelpRequestSchema.pre('save', function () {
  syncQuantityAndStatus(this);
});

HelpRequestSchema.index({ helpType: 1, subCategory: 1, status: 1 });
HelpRequestSchema.index({
  'location.governorate': 1,
  'location.district': 1,
});
HelpRequestSchema.index({ expiresAt: 1 });
HelpRequestSchema.index({ createdBy: 1, status: 1 });
HelpRequestSchema.index({ deletedAt: 1 });
