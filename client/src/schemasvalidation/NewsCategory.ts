import z from "zod";
import { MultiLang } from "./trans";

export const ActionBy = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const MetaFilter = z.object({
  current: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export type MetaFilterType = z.infer<typeof MetaFilter>;

//- start category news
export const apiCategoryNewsRes = z.object({
  _id: z.string(),
  name: MultiLang,
  slug: MultiLang,
  isDelete: z.boolean(),
  summary: MultiLang,
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: ActionBy,
});

export type CategoryNewsResType = z.infer<typeof apiCategoryNewsRes>;

export const apiCateNewsID = apiCategoryNewsRes.omit({
  isDelete: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});
export type CateNewsIDType = z.infer<typeof apiCateNewsID>;

export interface Category {
  _id?: string;
  name: {
    vi: string;
    en: string;
  };
  summary: {
    vi: string;
    en: string;
  };
}

//- create
export const cateNewsCreate = z.object({
  name: z.string(),
  summary: z.string(),
});

export type CateNewsCreateType = z.infer<typeof cateNewsCreate>;

//- end category news

//- News
export const apiNewsRes = z.object({
  _id: z.string(),
  title: MultiLang,
  cateNewsID: z.array(apiCateNewsID),
  description: z.string(),
  image: z.string(),
  summary: MultiLang,
  status: z.enum(["inactive", "active"]),
  isDeleted: z.boolean(),
  deletedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),

  updatedBy: ActionBy,
  createdBy: ActionBy,
});

export type NewsResType = z.infer<typeof apiNewsRes>;

export const apiNewsResFilter = apiNewsRes
  .omit({ cateNewsID: true }) //- Xóa field cũ
  .extend({
    cateNewsID: z.array(z.string()), //- Thêm field mới với kiểu string[]
  });

export type NewsResFilterType = z.infer<typeof apiNewsResFilter>;

export const apiNewsResFilterResult = z.object({
  meta: MetaFilter,
  result: z.array(apiNewsResFilter),
});

export type NewsResFilterResultType = z.infer<typeof apiNewsResFilterResult>;

//- create News
export const newsCreate = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  cateNewsID: z.string().min(1, "Chọn danh mục"),
  summary: z.string().min(1, "Nhập tóm tắt"),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export type NewsCreateType = z.infer<typeof newsCreate>;
