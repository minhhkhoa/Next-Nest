export const AD_PAGE_OPTIONS = [
  'HOME',
  'JOB_DETAIL',
  'COMPANY_DETAIL',
] as const;

export const AD_MODE_ALLOWED_OPTIONS = [
  'NON_DISMISSIBLE',
  'DISMISSIBLE',
  'BOTH',
] as const;

export const AD_TYPE_OPTIONS = ['NON_DISMISSIBLE', 'DISMISSIBLE'] as const;

export const AD_BOOKING_STATUS_OPTIONS = [
  'PENDING_PAYMENT', //- chờ thanh toán
  'SCHEDULED', //- đã lên lịch chạy(có thể chưa tới ngày chạy) - (hệ thống đã ghi nhận thanh toán thành công)
  'RUNNING', //- ad đang được chạy
  'COMPLETED', //- đã chạy xong quảng cáo
  'CANCELLED', //- bị hủy chủ động bởi admin - khách hàng.
  'EXPIRED', //- hết hạn tự động (hệ thống hủy vì khách hàng không thanh toán sau 15 phút)
] as const;

export const AD_PAYMENT_PROVIDER_OPTIONS = ['SEPAY'] as const;

export const AD_PAYMENT_STATUS_OPTIONS = [
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED',
] as const;
