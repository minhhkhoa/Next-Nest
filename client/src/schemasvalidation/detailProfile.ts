import { Gender } from "@/lib/constant";
import { z } from "zod";

export interface Education {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export const DetailProfileBaseSchema = z.object({
  userID: z.string().optional(),
  sumary: z.string().min(1, "Vui lòng nhập tóm tắt"),
  gender: z.nativeEnum(Gender),
  industryID: z.array(z.string()), //- chỉ cần id khi CRUD
  skillID: z.array(z.string()), //- chỉ cần id khi CRUD
  desiredSalary: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  }),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
  ),
  level: z.string(),
  address: z.string(),
  isDeleted: z.boolean().optional(),
});

export const PopulatedItemSchema = z.object({
  _id: z.string(),
  name: z.object({
    vi: z.string(),
    en: z.string(),
  }),
});

export const DetailProfileResponseSchema = DetailProfileBaseSchema.extend({
  _id: z.string(),
  userID: z.string(), //- ref user
  industryID: z.array(PopulatedItemSchema), // populated
  skillID: z.array(PopulatedItemSchema), // populated
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().optional(),
});

export type DetailProfileBaseType = z.infer<typeof DetailProfileBaseSchema>; //- cho form
export type DetailProfileResponseType = z.infer<
  typeof DetailProfileResponseSchema
>;
