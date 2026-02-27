import { envConfig } from "../../config";

export const LEVEL_OPTIONS = [
  { value: "intern", label: "Intern" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export const EMPLOYEE_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "remote", label: "Remote" },
];

export const EXPERIENCE_OPTIONS = [
  { value: "no_experience", label: "Không yêu cầu kinh nghiệm" },
  { value: "less_than_1_year", label: "Dưới 1 năm" },
  { value: "1_to_3_years", label: "1 đến 3 năm" },
  { value: "3_to_5_years", label: "3 đến 5 năm" },
  { value: "5_to_10_years", label: "5 đến 10 năm" },
  { value: "more_than_10_years", label: "Trên 10 năm" },
];

export const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

export enum Gender {
  Boy = "Nam",
  Girl = "Nữ",
  Other = "Khác",
}

export const ADDRESS_OPTIONS = [
  //- 6 thành phố trực thuộc trung ương
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Thủ Đức",

  //- 28 tỉnh
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Đắk Lắk",
  "Đắk Nông",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nam",
  "Hà Tĩnh",
  "Hậu Giang",
  "Khánh Hòa",
  "Kiên Giang",
  "Lâm Đồng",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Nam",
  "Quảng Ngãi",
  "Thanh Hóa",
];

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export const segmentNameMap: Record<string, string> = {
  // -start page public
  "cate-news": "Hành trang nghề nghiệp",
  news: "Tin tức",
  profile: "Trang cá nhân",
  settings: "Cài đặt",
  jobs: "Việc làm",
  company: "Công ty",
  issue: "Vấn đề của tôi",
  // - end page public
};

//- start enum notification
export enum NotificationType {
  //- Module Company
  COMPANY_CREATED = "COMPANY_CREATED", // SUPER_ADMIN nhận: Yêu cầu duyệt cty
  COMPANY_ADMIN_REQUEST_PROCESSED = "COMPANY_ADMIN_REQUEST_PROCESSED", // SUPER_ADMIN duyệt/từ chối yêu cầu
  COMPANY_RECRUITER_JOINED = "COMPANY_RECRUITER_JOINED", // RECUITER_ADMIN nhận: Yêu cầu gia nhập của RECRUITER'
  COMPANY_JOIN_REQUEST_PROCESSED = "COMPANY_JOIN_REQUEST_PROCESSED", // RECRUITER_ADMIN duyệt/từ chối yêu cầu

  //- module Job
  JOB_CREATED = "JOB_CREATED", // RECRUITER_ADMIN nhận: Yêu cầu duyệt tin tuyển dụng mới
  JOB_VERIFIED = "JOB_VERIFIED", // RECRUITER nhận: Tin tuyển dụng được duyệt/từ chối
  JOB_UPDATED = "JOB_UPDATED", // RECRUITER_ADMIN nhận: Tin tuyển dụng được cập nhật bởi RECRUITER thường

  //- module issue
  ISSUE_CREATED = "ISSUE_CREATED", // Admin nhận: Có yêu cầu/báo cáo mới từ user
  ISSUE_ADMIN_REPLY = "ISSUE_ADMIN_REPLY", // User nhận: Admin đã phản hồi yêu cầu
  ISSUE_REQUEST_HOT = "ISSUE_REQUEST_HOT", // Admin nhận: Có yêu cầu hot job mới
  ISSUE_REQUEST_HOT_PROCESSED = "ISSUE_REQUEST_HOT_PROCESSED", // RECRUITER nhận: Yêu cầu hot job được duyệt/từ chối

  //- Module Resume
  RESUME_SUBMITTED = "RESUME_SUBMITTED", // Recruiter nhận: Có CV mới
  RESUME_STATUS_CHANGED = "RESUME_STATUS_CHANGED", // Candidate nhận: Trạng thái CV thay đổi

  //- Module News
  NEWS_CREATED = "NEWS_CREATED", // Admin nhận: Có tin mới

  //- Module System
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
}

//- các roles được phép vào trang quản trị của chúng
export const allowedRoles = [
  envConfig.NEXT_PUBLIC_ROLE_SUPER_ADMIN,
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER,
  envConfig.NEXT_PUBLIC_ROLE_RECRUITER_ADMIN,
  envConfig.NEXT_PUBLIC_ROLE_CONTENT_MANAGER,
];

export const COMPANY_SCALES = [
  { value: "1-10", label: "1 - 10 nhân viên" },
  { value: "11-50", label: "11 - 50 nhân viên" },
  { value: "51-200", label: "51 - 200 nhân viên" },
  { value: "201-500", label: "201 - 500 nhân viên" },
  { value: "500+", label: "Trên 500 nhân viên" },
];

//- start template cv
export const CV_TEMPLATES = {
  basicTemplate: "basic-template",
  impressiveTemplate: "impressive-template",
  modernTemplate: "modern-template",
  simpleTemplate: "simple-template",
};
//- end template cv

//- start constant cho issue
export const ISSUE_TYPE_OPTIONS = [
  {
    value: "REPORT_JOB",
    label: {
      en: "Report Job",
      vi: "Báo cáo tuyển dụng",
    },
  },
  {
    value: "REPORT_USER",
    label: {
      en: "Report User",
      vi: "Báo cáo người dùng",
    },
  },
  {
    value: "REPORT_COMPANY",
    label: {
      en: "Report Company",
      vi: "Báo cáo công ty",
    },
  },
  {
    value: "SUPPORT",
    label: {
      en: "Support",
      vi: "Hỗ trợ",
    },
  },
  {
    value: "FEEDBACK",
    label: {
      en: "Feedback",
      vi: "Phản hồi",
    },
  },

  //- xin hot
  {
    value: "REQUEST_HOT",
    label: {
      en: "Request Hot",
      vi: "Yêu cầu hot",
    },
  },
];

export const ISSUE_STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: {
      en: "Pending",
      vi: "Chờ xử lý",
    },
  },
  {
    value: "PROCESSING",
    label: {
      en: "Processing",
      vi: "Đang xử lý",
    },
  },
  {
    value: "RESOLVED",
    label: {
      en: "Resolved",
      vi: "Đã giải quyết",
    },
  },
  {
    value: "CLOSED",
    label: {
      en: "Closed",
      vi: "Đã đóng",
    },
  },
];

//- end constant cho issue

export const BOOKMARK_TYPE = [
  { value: "job", label: "Job" },
  { value: "news", label: "News" },
  { value: "company", label: "Company" },
];
