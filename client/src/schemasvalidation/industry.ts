import z from "zod";
import { MultiLang } from "./trans";

export const apiIndustryRes = z.object({
  _id: z.string(),
  name: MultiLang,
  parentId: z.string(),
});

export type IndustryResType = z.infer<typeof apiIndustryRes>;

const Meta = z.object({
  current: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
})

export const apiGetAllRes = z.object({
  meta: Meta,
  result: z.array(apiIndustryRes),
});

export type GetAllResType = z.infer<typeof apiGetAllRes>;
export type GetAllOmitMetaResType = Omit<GetAllResType, "meta">;

//- res tree
export const apiIndustryTreeNode: z.ZodType<any> = z.lazy(() =>
  apiIndustryRes.extend({
    isParent: z.boolean(),
    children: z.array(apiIndustryTreeNode),
  })
);

export type IndustryTreeNode = z.infer<typeof apiIndustryTreeNode>;

export const apiIndustryTreeResponse = z.array(apiIndustryTreeNode);
export type IndustryTreeResponse = z.infer<typeof apiIndustryTreeResponse>;