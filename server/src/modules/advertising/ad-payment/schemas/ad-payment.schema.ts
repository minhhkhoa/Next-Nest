import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AD_PAYMENT_PROVIDER_OPTIONS,
  AD_PAYMENT_STATUS_OPTIONS,
} from 'src/common/constants/ad-const';
import { Prop } from 'src/common/override/override-prop';
import { UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class AdPayment {
  @Prop({ type: Types.ObjectId, ref: 'AdBooking', required: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true, enum: AD_PAYMENT_PROVIDER_OPTIONS, default: 'SEPAY' })
  provider: string;

  @Prop({ required: true, unique: true, trim: true })
  orderCode: string;

  @Prop({ required: true, unique: true, trim: true })
  transferContent: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: AD_PAYMENT_STATUS_OPTIONS, default: 'PENDING' })
  status: string;

  @Prop()
  paidAt?: Date;

  @Prop({ type: Object })
  webhookPayload?: Record<string, any>;

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

export const AdPaymentSchema = SchemaFactory.createForClass(AdPayment);

AdPaymentSchema.index({ bookingId: 1, createdAt: -1 });

export type AdPaymentDocument = HydratedDocument<AdPayment>;
