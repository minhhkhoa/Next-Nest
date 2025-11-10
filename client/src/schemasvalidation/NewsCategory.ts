import z from "zod";
import { MultiLang } from "./trans";

export const ActionBy = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
});


export const apiCategoryNewsRes = z.object({
  _id: z.string(),
  name: MultiLang,
  isDelete: z.boolean(),
  summary: MultiLang,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  updatedBy: ActionBy,
});

export type CategoryNewsResType = z.infer<typeof apiCategoryNewsRes>;
