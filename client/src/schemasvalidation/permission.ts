import z from "zod";
import { MultiLang } from "./trans";
import { MetaFilter } from "./NewsCategory";

export const apiPermissionRes = z.object({
  _id: z.string(),
  name: MultiLang,
  description: MultiLang,
  isActived: z.boolean(),
  permissions: z.array(z.string()),
  isDeleted: z.boolean(),
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),

  createdBy: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  updatedBy: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  deletedBy: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});

export type PermissionResType = z.infer<typeof apiPermissionRes>;
export type PermissionResTypeFilter = z.infer<typeof apiPermissionRes>;


export const apiPermissionFilterRes = z.object({
  result: z.array(apiPermissionRes),
  meta: MetaFilter,
});

export type SkillFilterResType = z.infer<typeof apiPermissionFilterRes>;

//- create
export const permissionCreate = z.object({
  name: z
    .string()
    .min(1, "Tên kỹ năng không được để trống")
    .min(2, "Tên kỹ năng phải có ít nhất 2 ký tự")
    .max(100, "Tên kỹ năng không được quá 100 ký tự"),
  apiPath: z.string().min(1, "Tên kỹ năng không được để trống"),
  method: z.string().min(1, "Tên kỹ năng không được để trống"),
  module: z.string().min(1, "Tên kỹ năng không được để trống"),
});

export type PermissionCreateType = z.infer<typeof permissionCreate>;
