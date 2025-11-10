import z from "zod";
import { MultiLang } from "./trans";

export const ActionBy = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
});

//- category news
export const apiCategoryNewsRes = z.object({
  _id: z.string(),
  name: MultiLang,
  isDelete: z.boolean(),
  summary: MultiLang,
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: ActionBy,
});

export type CategoryNewsResType = z.infer<typeof apiCategoryNewsRes>;

export const apiCateNewsID = apiCategoryNewsRes.omit({
  isDelete: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});
export type CateNewsIDType = z.infer<typeof apiCateNewsID>;

//- News
export const apiNewsRes = z.object({
  _id: z.string(),
  title: MultiLang,
  cateNewsID: z.array(apiCateNewsID),
  description: MultiLang,
  image: z.string(),
  summary: MultiLang,
  status: z.enum(["inactive", "active"]),
  isDeleted: z.boolean(),
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),

  updatedBy: ActionBy,
  createdBy: ActionBy,
});

export type NewsResType = z.infer<typeof apiNewsRes>;
