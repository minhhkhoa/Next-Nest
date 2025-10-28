import z from "zod";

export const MultiLang = z.object({
  vi: z.string(),
  en: z.string(),
});