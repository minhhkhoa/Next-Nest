import z from "zod";
import { apiSkillRes } from "./skill";
import { MetaFilter } from "./NewsCategory";

export const apiProfileUserRes = z.object({
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    avatar: z.string().nullable().optional(),
    companyID: z.string().array().optional().nullable(),
    roleID: z.string().array().optional().nullable(),
    provider: z
      .object({
        type: z.string(),
        id: z.string(),
      })
      .optional()
      .nullable(),
  }),
});

export type ProfileResType = z.infer<typeof apiProfileUserRes>;

export const userResponseSchema = apiProfileUserRes.shape.user;
export type UserResponseType = z.infer<typeof userResponseSchema>;

export const updateUserSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().url().nullable().optional(),
  companyID: z.string().optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

//- getAllUserByFilter
export const apiUserRes = z.object({
  _id: z.string(),
  userID: z.string(),
  sumary: z.string(),
  gender: z.string(),
  industryID: z.array(z.string()),
  skillID: z.array(z.string()),
  desiredSalary: z.object({
    min: z.number(),
    max: z.number(),
  }),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    })
  ),
  level: z.string(),
  address: z.string(),
  isDeleted: z.boolean(),
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
    roleID: z.array(z.string()),
    provider: z.object({
      type: z.string(),
      id: z.string(),
    }).optional(),
    isDeleted: z.boolean(),
    deletedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export type apiUserResType = z.infer<typeof apiUserRes>;

export const getAllUserByFilterRes = z.object({
  result: z.array(apiUserRes),
  meta: MetaFilter,
});

export type GetAllUserByFilterResType = z.infer<
  typeof getAllUserByFilterRes
>;
//- end getAllUserByFilter
