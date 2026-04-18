export const AD_PAGE_OPTIONS = ['HOME', 'JOB_DETAIL', 'COMPANY_DETAIL'] as const;

export const AD_MODE_ALLOWED_OPTIONS = [
  'NON_DISMISSIBLE',
  'DISMISSIBLE',
  'BOTH',
] as const;

export const AD_TYPE_OPTIONS = ['NON_DISMISSIBLE', 'DISMISSIBLE'] as const;

export const AD_BOOKING_STATUS_OPTIONS = [
  'PENDING_PAYMENT',
  'WAITING_SLOT',
  'SCHEDULED',
  'RUNNING',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
] as const;

export const AD_PAYMENT_PROVIDER_OPTIONS = ['SEPAY'] as const;

export const AD_PAYMENT_STATUS_OPTIONS = [
  'PENDING',
  'PAID',
  'FAILED',
  'EXPIRED',
] as const;
