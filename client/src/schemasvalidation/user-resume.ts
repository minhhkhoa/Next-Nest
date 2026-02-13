import { z } from "zod";

export const CreateUserResumeSchema = z.object({
  resumeName: z.string().min(1, "Vui lòng nhập tên CV"),
  templateID: z.string().min(1, "Vui lòng chọn mẫu CV"),
  content: z.any(),
  isDefault: z.boolean().optional(),
});

export type CreateUserResumeType = z.infer<typeof CreateUserResumeSchema>;
export type UserResumeResponseType = CreateUserResumeType & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};
