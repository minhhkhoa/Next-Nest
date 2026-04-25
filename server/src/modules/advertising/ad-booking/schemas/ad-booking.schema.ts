import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AD_BOOKING_STATUS_OPTIONS,
  AD_TYPE_OPTIONS,
} from 'src/common/constants/ad-const';
import { Prop } from 'src/common/override/override-prop';
import { UserAudit } from 'src/utils/typeSchemas';

@Schema({ timestamps: true })
export class AdBooking {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recruiterId: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true })
  slotCode: string;

  @Prop({ required: true, enum: AD_TYPE_OPTIONS })
  adType: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  targetUrl: string;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({
    required: true,
    enum: AD_BOOKING_STATUS_OPTIONS,
    default: 'PENDING_PAYMENT',
  })
  status: string;

  @Prop({ min: 1 })
  queueNo?: number;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: Types.ObjectId, ref: 'AdPayment' })
  paymentId?: Types.ObjectId;

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

export const AdBookingSchema = SchemaFactory.createForClass(AdBooking);

AdBookingSchema.index({ slotCode: 1, status: 1, startAt: 1 });
AdBookingSchema.index({ slotCode: 1, queueNo: 1 });
AdBookingSchema.index({ companyId: 1, createdAt: -1 });

export type AdBookingDocument = HydratedDocument<AdBooking>;
