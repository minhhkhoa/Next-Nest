import { z } from "zod";

//- schema tĩnh phục vụ suy diễn kiểu (type inference)
export const LoginBody = z
  .object({
    email: z.string().trim().email(),
    password: z.string().trim().min(8).max(100),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = z.object({
  access_token: z.string(),
  user: z.object({
    _id: z.string(),
    avatar: z.string(),
    email: z.string(),
    name: z.string(),
    employerInfo: z
      .object({
        companyID: z.string(),
        userStatus: z.string(),
        isOwner: z.boolean(),
      })
      .optional(),
    roleID: z.array(z.string()),
  }),
});

export type LoginResType = z.TypeOf<typeof LoginRes>;

export const RegisterBody = z
  .object({
    name: z.string().trim(),
    email: z.string().trim().email(),
    password: z.string().trim().min(8).max(100),
  })
  .strict();

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RegisterRes = z.object({
  _id: z.string(),
  createdAt: z.string(),
});

export type RegisterResType = z.TypeOf<typeof RegisterRes>;

//- schema tĩnh phục vụ suy diễn kiểu (type inference)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

//- hàm động sinh schema dùng đa ngôn ngữ
export const getLoginBodySchema = (t: any) => z
  .object({
    email: z
      .string({ message: t("EnterEmail") })
      .trim()
      .email({ message: t("EmailInvalid") }),

    password: z
      .string({ message: t("EnterPassword") })
      .trim()
      .min(8, { message: t("PasswordMinLength") })
      .max(100, { message: t("PasswordMaxLength") }),
  })
  .strict();

//- hàm động sinh schema dùng đa ngôn ngữ
export const getRegisterBodySchema = (t: any) => z
  .object({
    name: z.string({ message: t("EnterName") }).trim(),

    email: z
      .string({ message: t("EnterEmail") })
      .trim()
      .email({ message: t("EmailInvalid") }),

    password: z
      .string({ message: t("EnterPassword") })
      .trim()
      .min(8, { message: t("PasswordMinLength") })
      .max(100, { message: t("PasswordMaxLength") }),
  })
  .strict();

//- hàm động sinh schema dùng đa ngôn ngữ
export const getChangePasswordSchema = (t: any) => z
  .object({
    currentPassword: z.string().min(1, t("CurrentPasswordRequired")),
    newPassword: z.string().min(8, t("PasswordMinLength")),
    confirmPassword: z.string().min(1, t("ConfirmPasswordRequired")),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t("PasswordMismatch"),
    path: ["confirmPassword"],
  });
