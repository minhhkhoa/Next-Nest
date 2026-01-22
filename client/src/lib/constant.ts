import { envConfig } from "../../config";

export const LEVEL_OPTIONS = [
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
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
  // - end page public
};

//- start enum notification
export enum NotificationType {
  //- Module Company
  COMPANY_CREATED = "COMPANY_CREATED", // Admin nhận: Yêu cầu duyệt cty
  COMPANY_APPROVED = "COMPANY_APPROVED", // User nhận: Cty được duyệt
  COMPANY_REJECTED = "COMPANY_REJECTED", // User nhận: Cty bị từ chối
  COMPANY_RECRUITER_JOINED = "COMPANY_RECRUITER_JOINED", // RECUITER_ADMIN nhận: Yêu cầu gia nhập của RECRUITER'
  COMPANY_JOIN_REQUEST_PROCESSED = "COMPANY_JOIN_REQUEST_PROCESSED", // RECRUITER_ADMIN duyệt/từ chối yêu cầu
  COMPANY_ADMIN_REQUEST_PROCESSED = "COMPANY_ADMIN_REQUEST_PROCESSED", // SUPER_ADMIN duyệt/từ chối yêu cầu

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
