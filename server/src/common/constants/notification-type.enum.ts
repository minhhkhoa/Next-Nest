//- định nghĩa các type thông báo dùng trong hệ thống cả front-end và back-end

export enum NotificationType {
  //- Module Company
  COMPANY_CREATED = 'COMPANY_CREATED', // SUPER_ADMIN nhận: Yêu cầu duyệt cty
  COMPANY_ADMIN_REQUEST_PROCESSED = 'COMPANY_ADMIN_REQUEST_PROCESSED', // SUPER_ADMIN duyệt/từ chối yêu cầu
  COMPANY_RECRUITER_JOINED = 'COMPANY_RECRUITER_JOINED', // RECUITER_ADMIN nhận: Yêu cầu gia nhập của RECRUITER'
  COMPANY_JOIN_REQUEST_PROCESSED = 'COMPANY_JOIN_REQUEST_PROCESSED', // RECRUITER_ADMIN duyệt/từ chối yêu cầu

  //- module Job
  JOB_CREATED = 'JOB_CREATED', // RECRUITER_ADMIN nhận: Yêu cầu duyệt tin tuyển dụng mới
  JOB_VERIFIED = 'JOB_VERIFIED', // RECRUITER nhận: Tin tuyển dụng được duyệt/từ chối
  JOB_UPDATED = 'JOB_UPDATED', // RECRUITER_ADMIN nhận: Tin tuyển dụng được cập nhật bởi RECRUITER thường

  //- module issue
  ISSUE_CREATED = 'ISSUE_CREATED', // Admin nhận: Có yêu cầu/báo cáo mới từ user
  ISSUE_ADMIN_REPLY = 'ISSUE_ADMIN_REPLY', // User nhận: Admin đã phản hồi yêu cầu
  ISSUE_REQUEST_HOT = 'ISSUE_REQUEST_HOT', // Admin nhận: Có yêu cầu hot job mới
  ISSUE_REQUEST_HOT_PROCESSED = 'ISSUE_REQUEST_HOT_PROCESSED', // RECRUITER nhận: Yêu cầu hot job được duyệt

  //- Module Resume
  RESUME_SUBMITTED = 'RESUME_SUBMITTED', // Recruiter nhận: Có CV mới
  RESUME_STATUS_CHANGED = 'RESUME_STATUS_CHANGED', // Candidate nhận: Trạng thái CV thay đổi

  //- Module News
  NEWS_CREATED = 'NEWS_CREATED', // Admin nhận: Có tin mới

  //- Module System
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}
