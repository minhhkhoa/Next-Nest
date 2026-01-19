//- định nghĩa các type thông báo dùng trong hệ thống cả front-end và back-end

export enum NotificationType {
  //- Module Company
  COMPANY_CREATED = 'COMPANY_CREATED', // Admin nhận: Yêu cầu duyệt cty
  COMPANY_APPROVED = 'COMPANY_APPROVED', // User nhận: Cty được duyệt
  COMPANY_REJECTED = 'COMPANY_REJECTED', // User nhận: Cty bị từ chối

  //- Module Resume
  RESUME_SUBMITTED = 'RESUME_SUBMITTED', // Recruiter nhận: Có CV mới
  RESUME_STATUS_CHANGED = 'RESUME_STATUS_CHANGED', // Candidate nhận: Trạng thái CV thay đổi

  //- Module News
  NEWS_CREATED = 'NEWS_CREATED', // Admin nhận: Có tin mới

  //- Module System
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}
