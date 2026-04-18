import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AD_MODE_ALLOWED_OPTIONS, AD_PAGE_OPTIONS } from 'src/common/constants/ad-const';
import { Prop } from 'src/common/override/override-prop';
import { UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class AdSlot {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: AD_PAGE_OPTIONS })
  page: string;

  @Prop({ required: true, enum: AD_MODE_ALLOWED_OPTIONS, default: 'BOTH' })
  adModeAllowed: string;

  @Prop({ required: true, min: 1 })
  width: number;

  @Prop({ required: true, min: 1 })
  height: number;

  @Prop({ required: true, min: 1 })
  pricePerDay: number;

  @Prop({ required: true, min: 1, default: 14 })
  maxDurationDays: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Object })
  createdBy: UserAudit;

  @Prop({ type: Object })
  updatedBy: UserAudit;

  @Prop({ type: Object })
  deletedBy: UserAudit;
}

export const AdSlotSchema = SchemaFactory.createForClass(AdSlot);
AdSlotSchema.index({ isActive: 1, isDeleted: 1 });

export type AdSlotDocument = HydratedDocument<AdSlot>;
