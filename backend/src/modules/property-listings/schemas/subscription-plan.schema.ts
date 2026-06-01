import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SubscriptionPlanCode } from '../../../common/enums';

@Schema({ timestamps: true, collection: 'subscription_plans' })
export class SubscriptionPlan {
  @Prop({
    type: String,
    enum: SubscriptionPlanCode,
    required: true,
    unique: true,
  })
  code: SubscriptionPlanCode;

  @Prop({ required: true, trim: true })
  name: string;

  /** null = unlimited active listings */
  @Prop({ type: Number, default: null })
  maxActiveListings: number | null;

  @Prop({ default: true })
  isActive: boolean;
}

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlan>;
export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
