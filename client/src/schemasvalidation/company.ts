import z from "zod";
import { MultiLang } from "./trans";
import { ActionBy } from "./NewsCategory";

export const apiCompanyRes = z.object({
  _id: z.string(),
  name: z.string(),
  taxCode: z.string(),
  status: z.string(),
  address: z.string(),
  description: MultiLang,
  industryID: z.array(z.string()),
  totalMember: z.string(),
  website: z.string(),
  isDeleted: z.boolean(),
  logo: z.string(),
  banner: z.string(),
  userFollow: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: ActionBy,
  updatedBy: ActionBy,
  deletedAt: z.date(),
  deletedBy: ActionBy
});

export type CompanyResType = z.infer<typeof apiCompanyRes>;

//- create
export const companyCreate = z.object({
  name: z.string(),
  taxCode: z.string(),
  address: z.string(),
  description: z.string(),
  industryID: z.array(z.string()),
  totalMember: z.string(),
  website: z.string(),
  banner: z.string(),
  logo: z.string(),
});

export type CompanyCreateType = z.infer<typeof companyCreate>;

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
