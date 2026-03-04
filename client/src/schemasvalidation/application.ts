import z from "zod";
import { ActionBy, MetaFilter } from "./NewsCategory";
import { APPLICATION_STATUS, RESUME_TYPE } from "@/lib/constant";
import { MultiLang } from "./trans";
import { salaryRangeSchema } from "./job";

//- dữ liệu cv hệ thống
export const SystemCvData = z.object({
  userResumeId: z.lazy(() =>
    z.union([
      z.string(),
      z.object({
        _id: z.string(),
        resumeName: z.string(),
      }),
    ]),
  ), // Can be ID or Populated Object
  templateId: z.string(),
  resumeContent: z.any(),
});

export const ApplicationHistory = z.object({
  status: z.enum(APPLICATION_STATUS.map((status) => status.value)),
  note: z.string(),
  updatedAt: z.date(),
  updatedBy: ActionBy.optional(),
});

export const apiApplicationRes = z.object({
  _id: z.string(),
  userId: z.union([z.string(), ActionBy]), // ID or Populated User
  jobId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      title: MultiLang,
      slug: MultiLang,
      salary: salaryRangeSchema,
    }),
  ]),
  companyId: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      name: z.string(),
      logo: z.string().optional(),
    }),
  ]),
  email: z.string(),
  resumeType: z.enum(RESUME_TYPE.map((type) => type.value)),
  cvUrl: z.string().optional(),
  systemCvData: SystemCvData.optional(),
  coverLetter: z.string().optional(),
  status: z.enum(APPLICATION_STATUS.map((status) => status.value)),
  isViewed: z.boolean(),
  rating: z.number().min(0).max(5),
  recruiterNote: z.string().optional(),
  interviewTime: z.date().or(z.string()).optional(),
  rejectionReason: z.string().optional(),
  history: z.array(ApplicationHistory).optional(),
  isDeleted: z.boolean(),
  createdBy: ActionBy.optional(),
  updatedBy: ActionBy.optional(),
  deletedBy: ActionBy.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export type ApplicationResType = z.infer<typeof apiApplicationRes>;

//- create application schema
export const createApplicationSchema = z
  .object({
    jobId: z.string().min(1, "Job ID không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    resumeType: z.enum(RESUME_TYPE.map((type) => type.value)).default("UPLOAD_CV"),
    cvUrl: z.string().url("Link CV không hợp lệ").optional(),
    systemCvData: z
      .object({
        userResumeId: z.string().min(1, "Vui lòng chọn CV"),
        templateId: z.string().min(1, "Template ID thiếu"),
        resumeContent: z.any(),
      })
      .optional(),
    coverLetter: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.resumeType === "UPLOAD_CV") return !!data.cvUrl;
      if (data.resumeType === "SYSTEM_CV") return !!data.systemCvData;
      return false;
    },
    {
      message: "Vui lòng cung cấp CV (Link hoặc CV hệ thống)",
      path: ["resumeType"], // Highlight resumeType if validation fails
    },
  );

export type CreateApplicationType = z.infer<typeof createApplicationSchema>;

//- update application schema
export const updateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUS.map((status) => status.value)).optional(),
  isViewed: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  recruiterNote: z.string().optional(),
  interviewTime: z.date().or(z.string()).optional(),
  rejectionReason: z.string().optional(),
});

export type UpdateApplicationType = z.infer<typeof updateApplicationSchema>;

//- filter application schema
export const findApplicationFilterSchema = z.object({
  currentPage: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
  status: z.enum(APPLICATION_STATUS.map((status) => status.value)).optional(),
  jobId: z.string().optional(),
  isViewed: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  keyword: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export type FindApplicationFilterType = z.infer<
  typeof findApplicationFilterSchema
>;

//- response schema for get all application with filter
export const apiGetAllApplicationFilterRes = z.object({
  meta: MetaFilter,
  result: z.array(apiApplicationRes),
});

export type GetAllApplicationFilterType = z.infer<
  typeof apiGetAllApplicationFilterRes
>;
