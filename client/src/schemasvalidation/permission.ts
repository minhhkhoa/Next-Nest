import z from "zod";
import { MultiLang } from "./trans";
import { MetaFilter } from "./NewsCategory";

export const apiPermissionRes = z.object({
  _id: z.string(),
  name: MultiLang,
  code: z.string(),
  apiPath: z.string(),
  method: z.string(),
  module: z.string(),
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

export const apiPermissionFilterRes = z.object({
  result: z.array(apiPermissionRes),
  meta: MetaFilter,
});

export type PermissionResTypeFilter = z.infer<typeof apiPermissionFilterRes>;

//- create
export const permissionCreate = z.object({
  name: z
    .string()
    .min(1, "Tên quyền hạn không được để trống")
    .min(2, "Tên quyền hạn phải có ít nhất 2 ký tự")
    .max(100, "Tên quyền hạn không được quá 100 ký tự"),
  code: z.string().min(1, "Mã quyền hạn không được để trống"),
  apiPath: z.string().min(1, "apiPath quyền hạn không được để trống"),
  method: z.string().min(1, "Phương thức quyền hạn không được để trống"),
  module: z.string().min(1, "Module quyền hạn không được để trống"),
});

export type PermissionCreateType = z.infer<typeof permissionCreate>;

export type GroupedPermissionRes = Record<string, PermissionResType[]>;
