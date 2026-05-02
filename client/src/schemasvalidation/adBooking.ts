import { z } from "zod";

export const CreateAdBookingBody = z.object({
  slotCode: z.string().min(1, "Vui lòng chọn vị trí quảng cáo"),
  adType: z.string().min(1, "Vui lòng chọn loại quảng cáo"),
  imageUrl: z.string().url("Đường dẫn hình ảnh không hợp lệ"),
  targetUrl: z.string().url("Đường dẫn đích không hợp lệ"),
  startAt: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endAt: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
});

export type CreateAdBookingBodyType = z.TypeOf<typeof CreateAdBookingBody>;

export const AdPaymentRes = z.object({
  _id: z.string(),
  bookingId: z.string(),
  provider: z.string(),
  orderCode: z.string(),
  transferContent: z.string(),
  amount: z.number(),
  status: z.string(),
  transactionId: z.string().optional(),
  paymentDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdPaymentResType = z.TypeOf<typeof AdPaymentRes>;

export const AdBookingRes = z.object({
  _id: z.string(),
  companyId: z.string(),
  recruiterId: z.string(),
  slotCode: z.string(),
  adType: z.string(),
  imageUrl: z.string(),
  targetUrl: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.string(),
  queueNo: z.number().optional(),
  amount: z.number(),
  paymentId: z.union([z.string(), AdPaymentRes]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AdBookingResType = z.TypeOf<typeof AdBookingRes>;
