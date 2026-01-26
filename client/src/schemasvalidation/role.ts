import z from "zod";
import { MultiLang } from "./trans";
import { ActionBy, MetaFilter } from "./NewsCategory";

export const apiRoleRes = z.object({
  _id: z.string(),
  name: MultiLang,
  description: MultiLang,
  isActived: z.boolean(),
  permissions: z.array(z.string()),
  isDeleted: z.boolean(),

  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),

  createdBy: ActionBy,
  updatedBy: ActionBy,
  deletedBy: ActionBy,
});

export type RoleResType = z.infer<typeof apiRoleRes>;

export const apiRoleFilterRes = z.object({
  result: z.array(apiRoleRes),
  meta: MetaFilter,
});

export type RoleResTypeFilter = z.infer<typeof apiRoleFilterRes>;

//- create
export const roleCreate = z.object({
  name: z
    .string()
    .min(1, "Tên vai trò không được để trống")
    .min(2, "Tên vai trò phải có ít nhất 2 ký tự")
    .max(100, "Tên vai trò không được quá 100 ký tự"),
  isActived: z.boolean(),
  description: z.string().min(1, "apiPath vai trò không được để trống"),
  permissions: z.array(z.string()),
});

export type RoleCreateType = z.infer<typeof roleCreate>;
