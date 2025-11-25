import z from "zod";
import { MultiLang } from "./trans";
import { apiIndustryRes } from "./industry";
import { MetaFilter } from "./NewsCategory";

export const apiSkillRes = z.object({
  _id: z.string(),
  name: MultiLang,
  industryID: z.array(apiIndustryRes),
});

export type SkillResType = z.infer<typeof apiSkillRes>;

export type SkillResOmitIndustryType = Omit<SkillResType, "industryID">;

//- filter
export const apiSkillRes2 = z.object({
  _id: z.string(),
  name: MultiLang,
  industryID: z.array(z.string()),
});
export const apiSkillFilterRes = z.object({
  result: z.array(apiSkillRes2),
  meta: MetaFilter,
});

export type SkillFilterResType = z.infer<typeof apiSkillFilterRes>;
