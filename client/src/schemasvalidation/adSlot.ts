import z from "zod";
import { ActionBy, MetaFilter } from "./NewsCategory";

//- Các enum constants cho ad-slot (mirror từ backend)
export const AD_PAGE_OPTIONS = ["HOME", "JOB_DETAIL", "COMPANY_DETAIL"] as const;
export const AD_MODE_ALLOWED_OPTIONS = [
  "NON_DISMISSIBLE",
  "DISMISSIBLE",
  "BOTH",
] as const;

//- Schema response từ API cho một ad-slot
export const apiAdSlotRes = z.object({
  _id: z.string(),
  code: z.string(),
  name: z.string(),
  page: z.enum(AD_PAGE_OPTIONS),
  adModeAllowed: z.enum(AD_MODE_ALLOWED_OPTIONS),
  width: z.number(),
  height: z.number(),
  pricePerDay: z.number(),
  maxDurationDays: z.number(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  createdBy: ActionBy.optional(),
  updatedBy: ActionBy.optional(),
  deletedBy: ActionBy.optional(),
});

export type AdSlotResType = z.infer<typeof apiAdSlotRes>;

//- Schema tạo mới ad-slot (form validation)
export const adSlotCreate = z.object({
  code: z
    .string()
    .min(1, "Mã slot không được để trống")
    .regex(/^[A-Z0-9_]+$/i, "Mã slot chỉ gồm chữ, số, dấu gạch dưới"),

  name: z.string().min(1, "Tên slot không được để trống"),

  page: z.enum(AD_PAGE_OPTIONS, {
    error: "Vui lòng chọn trang hiển thị",
  }),

  adModeAllowed: z.enum(AD_MODE_ALLOWED_OPTIONS).default("BOTH"),

  width: z
    .number({ error: "Chiều rộng phải là số" })
    .int("Chiều rộng phải là số nguyên")
    .min(1, "Chiều rộng tối thiểu là 1px"),

  height: z
    .number({ error: "Chiều cao phải là số" })
    .int("Chiều cao phải là số nguyên")
    .min(1, "Chiều cao tối thiểu là 1px"),

  pricePerDay: z
    .number({ error: "Giá thuê phải là số" })
    .int("Giá thuê phải là số nguyên")
    .min(1000, "Giá thuê tối thiểu là 1.000đ"),

  maxDurationDays: z
    .number({ error: "Số ngày tối đa phải là số" })
    .int("Số ngày phải là số nguyên")
    .min(1, "Tối thiểu 1 ngày")
    .default(14),

  isActive: z.boolean().default(true),
});

export type AdSlotCreateType = z.infer<typeof adSlotCreate>;

//- Schema cập nhật (tất cả optional)
export const adSlotUpdate = adSlotCreate.partial();

export type AdSlotUpdateType = z.infer<typeof adSlotUpdate>;

//- Schema response dạng danh sách + phân trang
export const apiAdSlotFilterRes = z.object({
  meta: MetaFilter,
  result: z.array(apiAdSlotRes),
});

export type AdSlotFilterResType = z.infer<typeof apiAdSlotFilterRes>;
