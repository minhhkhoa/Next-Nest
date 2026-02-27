import z from "zod";
import { ActionBy } from "./NewsCategory";

export const apiBookmarkRes = z.object({
  _id: z.string(),
  userId: z.string(),
  itemId: z.string(),
  itemType: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date(),
  createdBy: ActionBy.optional(),
  updatedBy: ActionBy.optional(),
  deletedBy: ActionBy.optional(),
});

export type BookmarkResType = z.infer<typeof apiBookmarkRes>;

const Meta = z.object({
  current: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export const apiGetAllBookmarkRes = z.object({
  meta: Meta,
  result: z.array(apiBookmarkRes),
});

//- create
export const bookmarkCreate = z.object({
  itemId: z.string(),
  itemType: z.string(),
});

export type BookmarkCreateType = z.infer<typeof bookmarkCreate>;
