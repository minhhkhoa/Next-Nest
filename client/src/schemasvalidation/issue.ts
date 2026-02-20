import z from "zod";
import { MultiLang } from "./trans";
import { ActionBy, MetaFilter } from "./NewsCategory";
import { ISSUE_STATUS_OPTIONS, ISSUE_TYPE_OPTIONS } from "@/lib/constant";

export const apiIssueRes = z.object({
  _id: z.string(),
  createdBy: ActionBy,
  type: z.enum(ISSUE_TYPE_OPTIONS.map((opt) => opt.value)),
  targetId: z.string().optional(),
  title: MultiLang,
  description: MultiLang,
  attachments: z.array(z.string()),
  status: z.enum(ISSUE_STATUS_OPTIONS.map((opt) => opt.value)),

  adminResponse: z
    .object({
      adminId: z
        .string()
        .or(z.object({ _id: z.string() }))
        .optional(),
      content: MultiLang,
      repliedAt: z.date().or(z.string()),
    })
    .optional(),

  history: z
    .array(
      z.object({
        status: z.enum(ISSUE_STATUS_OPTIONS.map((opt) => opt.value)),
        updatedAt: z.date().or(z.string()),
        note: z.string().optional(),
      }),
    )
    .optional(),

  isDeleted: z.boolean(),
  deletedAt: z.date().or(z.string()).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),

  updatedBy: ActionBy.optional(),
  deletedBy: ActionBy.optional(),
});

export type IssueResType = z.infer<typeof apiIssueRes>;

export const apiIssueFilterRes = z.object({
  result: z.array(apiIssueRes),
  meta: MetaFilter,
});

export type IssueResTypeFilter = z.infer<typeof apiIssueFilterRes>;

//- Create Issue
export const issueCreate = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(1, "Nội dung không được để trống"),
  type: z.enum(ISSUE_TYPE_OPTIONS.map((option) => option.value)),
  targetId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export type IssueCreateType = z.infer<typeof issueCreate>;

//- Update Issue (User)
export const issueUpdate = issueCreate.partial();
export type IssueUpdateType = z.infer<typeof issueUpdate>;

//- Update Issue (Admin)
export const issueAdminUpdate = z.object({
  id: z.string(),
  status: z.enum(ISSUE_STATUS_OPTIONS.map((opt) => opt.value)),
  adminReply: z.string().min(1, "Phản hồi không được để trống"),
});

export type IssueAdminUpdateType = z.infer<typeof issueAdminUpdate>;
