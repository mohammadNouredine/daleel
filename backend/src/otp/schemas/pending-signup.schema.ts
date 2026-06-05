import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class SignupData {
  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ trim: true })
  whatsappNumber?: string;
}

export const SignupDataSchema = SchemaFactory.createForClass(SignupData);

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'pending_signups',
})
export class PendingSignup {
  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true })
  otpHash: string;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ default: false })
  consumed: boolean;

  @Prop({ type: SignupDataSchema, required: true })
  signupData: SignupData;

  @Prop({ default: 0, min: 0 })
  attempts: number;

  @Prop({ default: 0, min: 0 })
  sendCount: number;

  @Prop({ type: Date })
  lastSentAt?: Date;

  @Prop({ default: false })
  locked: boolean;
}

export type PendingSignupDocument = HydratedDocument<PendingSignup>;
export const PendingSignupSchema = SchemaFactory.createForClass(PendingSignup);

PendingSignupSchema.index({ email: 1 }, { unique: true });
PendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
