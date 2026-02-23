import z from "zod";
import { MultiLang } from "./trans";
import { ActionBy } from "./NewsCategory";

export const apiCompanyRes = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  totalJob: z.number().optional(),
  taxCode: z.string(),
  status: z.string(),
  address: z.string(),
  description: MultiLang,
  industryID: z.union([
    z.array(z.string()),
    z.array(
      z.object({
        _id: z.string(),
        name: MultiLang,
      }),
    ),
  ]),
  totalMember: z.string(),
  website: z.string(),
  logo: z.string(),
  banner: z.string(),
  isDeleted: z.boolean(),
  userFollow: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: ActionBy,
  updatedBy: ActionBy,
  deletedAt: z.date(),
  deletedBy: ActionBy,
});

export type CompanyResType = z.infer<typeof apiCompanyRes>;

//- create
export const companyCreate = z.object({
  name: z.string().min(1, "Tên công ty không được để trống"),
  taxCode: z.string(),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  industryID: z.array(z.string()),
  totalMember: z.string().min(1, "Vui lòng chọn quy mô"),
  website: z.string().min(1, "Website không được để trống"),
  banner: z.string().min(1, "Vui lòng tải lên banner công ty"),
  logo: z.string().min(1, "Vui lòng tải lên logo công ty"),
});

export type CompanyCreateType = z.infer<typeof companyCreate>;

//- cập nhật thì không có trường taxCode, omit nó đi
export const companyUpdate = companyCreate.omit({ taxCode: true });

export type CompanyUpdateType = z.infer<typeof companyUpdate>;

//- get company with filter
const Meta = z.object({
  current: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export const apiGetAllCompanyFilterRes = z.object({
  meta: Meta,
  result: z.array(apiCompanyRes),
});

export type TypeGetAllCompanyFilter = z.infer<typeof apiGetAllCompanyFilterRes>;
