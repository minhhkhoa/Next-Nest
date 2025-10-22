import z from "zod";

export const apiProfileUserRes = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    avatar: z.string().nullable().optional(),
    companyID: z.string().array().optional().nullable(),
    roleID: z.string().array().optional().nullable(),
  }),
});

export type ProfileResType = z.infer<typeof apiProfileUserRes>;

export const userResponseSchema = apiProfileUserRes.shape.user;
export type UserResponseType = z.infer<typeof userResponseSchema>;
