import z from "zod";
import { MultiLang } from "./trans";
import { ActionBy } from "./NewsCategory";
import {
  EMPLOYEE_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  LEVEL_OPTIONS,
} from "@/lib/constant";
import { apiCompanyRes } from "./company";

export const apiJobRes = z.object({
  _id: z.string(),
  title: MultiLang,
  slug: MultiLang,
  companyID: z.string(), //- nên populate thêm thông tin công ty khi lấy chi tiết
  company: apiCompanyRes.optional(), //- thông tin công ty khi đã populate
  industryID: z.array(z.string()),
  description: MultiLang,
  skills: z.array(z.string()),
  otherSkills: z.array(z.string()).optional(),
  location: z.string(),
  salary: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.enum(["VND", "USD"]),
  }),
  level: z.enum(LEVEL_OPTIONS.map((opt) => opt.value)),
  employeeType: z.enum(EMPLOYEE_TYPE_OPTIONS.map((opt) => opt.value)),
  experience: z.enum(EXPERIENCE_OPTIONS.map((opt) => opt.value)),
  quantity: z.number(),
  status: z.enum(["active", "inactive"]),
  isActive: z.boolean(),
  isHot: z.object({
    isHotJob: z.boolean(),
    hotUntil: z.date().nullable(),
  }),
  startDate: z.string(),
  endDate: z.string(),
  totalViews: z.number(),
  totalApplied: z.number(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
  createdBy: ActionBy.required(),
  updatedBy: ActionBy.optional(),
  deletedBy: ActionBy.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type JobResType = z.infer<typeof apiJobRes>;

//- create
//- Định nghĩa sub-object cho Salary (khớp với SalaryRangeDto)
const salaryRangeSchema = z
  .object({
    min: z.number({ error: "Lương phải là số" }).min(1, "Lương phải lớn hơn 0"),

    max: z.number({ error: "Lương phải là số" }).min(1, "Lương phải lớn hơn 0"),

    currency: z.enum(["VND", "USD"]).default("VND"),
  })
  .refine((data) => data.max >= data.min, {
    message: "Lương tối đa không được nhỏ hơn lương tối thiểu",
    path: ["max"],
  });

const otherSkillItemSchema = z.object({
  value: z.string().optional(), // Để optional để người dùng có thể để trống ô nhập
});

export const jobCreate = z
  .object({
    title: z.string().min(1, "Tiêu đề công việc không được để trống"),
    description: z.string().min(1, "Mô tả công việc không được để trống"),
    companyID: z.string().min(1, "Không tìm thấy thông tin công ty"),

    industryID: z
      .array(z.string())
      .min(1, "Vui lòng chọn ít nhất một ngành nghề"),
    skills: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một kỹ năng"),

    otherSkills: z.array(otherSkillItemSchema).optional(),

    location: z.string().min(1, "Địa chỉ làm việc không được để trống"),
    salary: salaryRangeSchema,

    //- level, employeeType, experience
    level: z
      .string()
      .refine((val) => LEVEL_OPTIONS.some((opt) => opt.value === val), {
        message: "Cấp bậc không hợp lệ",
      }),

    employeeType: z
      .string()
      .refine((val) => EMPLOYEE_TYPE_OPTIONS.some((opt) => opt.value === val), {
        message: "Loại hình làm việc không hợp lệ",
      }),

    experience: z
      .string()
      .refine((val) => EXPERIENCE_OPTIONS.some((opt) => opt.value === val), {
        message: "Kinh nghiệm không hợp lệ",
      }),

    quantity: z
      .number({ error: "Số lượng tuyển dụng phải là số" })
      .min(1, "Số lượng tuyển dụng ít nhất là 1"),

    //- Xử lý Date
    startDate: z.date({
      error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
      error: "Vui lòng chọn ngày kết thúc",
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  });

export type JobCreateType = z.infer<typeof jobCreate>;

//- jobUpdate sẽ kế thừa các field từ jobCreate nhưng ở dạng optional
//- sau đó thêm các field đặc thù của UpdateJobDto
export const jobUpdate = jobCreate.partial().extend({
  //- recruiter chủ động đóng/mở tin
  status: z.enum(["active", "inactive"]).optional(),

  //- dành cho recruiter_admin phê duyệt
  isActive: z.boolean().optional(),

  //- dành cho super_admin set tin hot
  isHot: z.boolean().optional(),

  //- số ngày muốn bài viết Hot (tối thiểu 1 ngày)
  hotDays: z.coerce
    .number({ error: "Số ngày Hot phải là số" })
    .min(1, "Số ngày Hot tối thiểu là 1")
    .optional(),
});
export type JobUpdateType = z.infer<typeof jobUpdate>;

export const jobUpdateRecuiter = jobCreate.partial().extend({
  //- recruiter chủ động đóng/mở tin
  status: z.enum(["active", "inactive"]).optional(),

  //- dành cho recruiter_admin phê duyệt
  isActive: z.boolean().optional(),
});

export type JobUpdateForRecruiterType = z.infer<typeof jobUpdateRecuiter>;

//- get company with filter
const Meta = z.object({
  current: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export const apiGetAllJobFilterRes = z.object({
  meta: Meta,
  result: z.array(apiJobRes),
});

export type TypeGetAllJobFilter = z.infer<typeof apiGetAllJobFilterRes>;
