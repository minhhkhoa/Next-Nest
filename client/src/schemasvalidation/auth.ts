import { z } from "zod";

export const LoginBody = z
  .object({
    email: z
      .string({ message: "Vui lòng nhập email" })
      .trim()
      .email({ message: "Email không hợp lệ" }),

    password: z
      .string({ message: "Vui lòng nhập mật khẩu" })
      .trim()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .max(100, { message: "Mật khẩu không được vượt quá 100 ký tự" }),
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
    companyID: z.array(z.string()),
    roleID: z.array(z.string()),
  }),
});

export type LoginResType = z.TypeOf<typeof LoginRes>;

export const RegisterBody = z
  .object({
    name: z.string({ message: "Vui lòng nhập tên" }).trim(),

    email: z
      .string({ message: "Vui lòng nhập email" })
      .trim()
      .email({ message: "Email không hợp lệ" }),

    password: z
      .string({ message: "Vui lòng nhập mật khẩu" })
      .trim()
      .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
      .max(100, { message: "Mật khẩu không được vượt quá 100 ký tự" }),
  })
  .strict();

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RegisterRes = z.object({
  _id: z.string(),
  createdAt: z.string(),
});

export type RegisterResType = z.TypeOf<typeof RegisterRes>;