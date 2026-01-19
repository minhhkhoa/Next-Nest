import z from "zod";
import { MultiLang } from "./trans";
import { MetaFilter } from "./NewsCategory";
import { NotificationType } from "@/lib/constant";

const MetadataSchema = z
  .object({
    module: z.string(),
    resourceId: z.string().optional(),
  })
  .passthrough();

export const apiNotificationRes = z.object({
  _id: z.string(),
  receiverId: z.string(),
  senderId: {
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
  },
  title: MultiLang,
  content: MultiLang,
  type: z.enum(NotificationType),
  metadata: MetadataSchema,
  isRead: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type NotificationResType = z.infer<typeof apiNotificationRes>;

export const apiNotificationFilterRes = z.object({
  result: z.array(apiNotificationRes),
  meta: MetaFilter,
});

export type NotificationResTypeFilter = z.infer<
  typeof apiNotificationFilterRes
>;
