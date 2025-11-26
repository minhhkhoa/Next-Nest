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

export type SkillRes2Type = z.infer<typeof apiSkillRes2>;
export const apiSkillFilterRes = z.object({
  result: z.array(apiSkillRes),
  meta: MetaFilter,
});

export type SkillFilterResType = z.infer<typeof apiSkillFilterRes>;

//- create
export const skillCreate = z.object({
  name: z
    .string()
    .min(1, "Tên kỹ năng không được để trống")
    .min(2, "Tên kỹ năng phải có ít nhất 2 ký tự")
    .max(100, "Tên kỹ năng không được quá 100 ký tự"),
  industryID: z.array(z.string()).nonempty("Chọn ngành nghề chính"),
});

export type SkillCreateType = z.infer<typeof skillCreate>;
