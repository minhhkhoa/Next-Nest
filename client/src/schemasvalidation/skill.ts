import z from "zod";
import { MultiLang } from "./trans";
import { apiIndustryRes } from "./industry";

export const apiSkillRes = z.object({
  _id: z.string(),
  name: MultiLang,
  industryID: z.array(apiIndustryRes),
});

export type SkillResType = z.infer<typeof apiSkillRes>;

export type SkillResOmitIndustryType = Omit<SkillResType, "industryID">;
