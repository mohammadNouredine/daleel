import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HelpUpdateType } from '../../../common/enums';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'help_updates',
})
export class HelpUpdate {
  @Prop({ type: Types.ObjectId, ref: 'HelpRequest', required: true })
  helpRequestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true, index: true })
  updatedBy: Types.ObjectId;

  @Prop({ type: String, enum: HelpUpdateType, required: true })
  updateType: HelpUpdateType;

  @Prop()
  previousQuantity: number;

  @Prop()
  newQuantity: number;

  @Prop()
  note: string;
}

export type HelpUpdateDocument = HydratedDocument<HelpUpdate>;
export const HelpUpdateSchema = SchemaFactory.createForClass(HelpUpdate);

HelpUpdateSchema.index({ helpRequestId: 1, createdAt: -1 });
