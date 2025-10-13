import { z } from "zod";

export const configSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string(),
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Các giá trị khai báo trong file .env không hợp lệ");
}
export const envConfig = configProject.data;
