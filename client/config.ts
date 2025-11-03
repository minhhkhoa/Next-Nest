import { z } from "zod";

export const configSchema = z.object({
  NEXT_PUBLIC_API_URL_SERVER: z.string(),
  NEXT_PUBLIC_API_URL_CLIENT: z.string(),
  NEXT_PUBLIC_TOKEN_TEST: z.string(),
  NEXT_PUBLIC_CLOUD_API: z.string(),
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_URL_SERVER: process.env.NEXT_PUBLIC_API_URL_SERVER,
  NEXT_PUBLIC_API_URL_CLIENT: process.env.NEXT_PUBLIC_API_URL_CLIENT,
  NEXT_PUBLIC_TOKEN_TEST: process.env.NEXT_PUBLIC_TOKEN_TEST,
  NEXT_PUBLIC_CLOUD_API: process.env.NEXT_PUBLIC_CLOUD_API,
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Các giá trị khai báo trong file .env không hợp lệ");
}
export const envConfig = configProject.data;
