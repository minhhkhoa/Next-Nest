//- định nghĩa các type thông báo dùng trong hệ thống cả front-end và back-end

export enum NotificationType {
  //- Module Company
  COMPANY_CREATED = 'COMPANY_CREATED', // SUPER_ADMIN nhận: Yêu cầu duyệt cty
  COMPANY_ADMIN_REQUEST_PROCESSED = 'COMPANY_ADMIN_REQUEST_PROCESSED', // SUPER_ADMIN duyệt/từ chối yêu cầu
  COMPANY_RECRUITER_JOINED = 'COMPANY_RECRUITER_JOINED', // RECUITER_ADMIN nhận: Yêu cầu gia nhập của RECRUITER'
  COMPANY_JOIN_REQUEST_PROCESSED = 'COMPANY_JOIN_REQUEST_PROCESSED', // RECRUITER_ADMIN duyệt/từ chối yêu cầu

  //- Module Resume
  RESUME_SUBMITTED = 'RESUME_SUBMITTED', // Recruiter nhận: Có CV mới
  RESUME_STATUS_CHANGED = 'RESUME_STATUS_CHANGED', // Candidate nhận: Trạng thái CV thay đổi

  //- Module News
  NEWS_CREATED = 'NEWS_CREATED', // Admin nhận: Có tin mới

  //- Module System
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}
