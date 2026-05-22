import { z } from "zod";

//- Zod schema cho SePay Webhook Payload
export const SePayWebhookPayloadSchema = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string(),
  code: z.string().optional().nullable(),
  content: z.string(),
  transferType: z.string(),
  transferAmount: z.number(),
  accumulated: z.number(),
  subAccount: z.string().optional().nullable(),
  referenceCode: z.string(),
  description: z.string(),
});

export type SePayWebhookPayloadType = z.TypeOf<typeof SePayWebhookPayloadSchema>;

//- Zod schema cho thông tin Recruiter được populate
export const AdPaymentRecruiterSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().optional().nullable(),
});

//- Zod schema cho thông tin Company được populate
export const AdPaymentCompanySchema = z.object({
  _id: z.string(),
  name: z.string(),
  taxCode: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
});

//- Zod schema cho Booking được populate trong AdPayment
export const AdPaymentBookingSchema = z.object({
  _id: z.string(),
  companyId: AdPaymentCompanySchema.optional().nullable(),
  recruiterId: AdPaymentRecruiterSchema.optional().nullable(),
  slotId: z.any(),
  adType: z.string(),
  imageUrl: z.string(),
  targetUrl: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.string(),
  amount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

//- Zod schema chính cho AdPaymentDetail
export const AdPaymentDetailRes = z.object({
  _id: z.string(),
  bookingId: AdPaymentBookingSchema.optional().nullable(),
  provider: z.string(),
  orderCode: z.string(),
  transferContent: z.string(),
  amount: z.number(),
  status: z.string(),
  paidAt: z.string().optional().nullable(),
  webhookPayload: SePayWebhookPayloadSchema.optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdPaymentDetailResType = z.TypeOf<typeof AdPaymentDetailRes>;
