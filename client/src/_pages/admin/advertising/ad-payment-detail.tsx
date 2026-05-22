"use client";

import { useState } from "react";

import { useGetAdPaymentDetailQuery } from "@/queries/useAdPayment";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { Copy, Check, Send } from "lucide-react";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Landmark,
  Mail,
  Receipt,
  User,
} from "lucide-react";

interface Props {
  id: string;
}

//- Hàm format tiền VND
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

//- Hàm format ngày an toàn
const safeFormatDate = (dateStr: any, fmt: string = "HH:mm - dd/MM/yyyy") => {
  try {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, fmt);
  } catch {
    return "N/A";
  }
};

export default function AdPaymentDetailPage({ id }: Props) {
  const router = useRouter();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const { data: res, isLoading, isError } = useGetAdPaymentDetailQuery(id);

  const payment = res?.data;

  //- Lấy booking đã populate
  const booking =
    payment?.bookingId &&
    typeof payment.bookingId === "object" &&
    "_id" in payment.bookingId
      ? (payment.bookingId as any)
      : null;

  const recruiter = booking?.recruiterId ?? null;
  const company   = booking?.companyId   ?? null;
  const webhook   = payment?.webhookPayload ?? null;

  //- Tính chênh lệch
  const amountDiff  = webhook && payment ? webhook.transferAmount - payment.amount : 0;
  const hasMismatch = payment?.status === "FAILED" || amountDiff !== 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl py-8 px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              Chi tiết đối soát thanh toán
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Thông tin chi tiết giao dịch và liên hệ khách hàng
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
            <p>Không tìm thấy giao dịch hoặc đã xảy ra lỗi.</p>
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
          </div>
        )}

        {/* Content */}
        {payment && (
          <div className="space-y-6">

            {/* Cảnh báo chênh lệch */}
            {hasMismatch && webhook && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-bold text-base mb-1">⚠ Cảnh báo: Sai lệch số tiền!</p>
                  <p>
                    Hóa đơn yêu cầu{" "}
                    <span className="font-bold">{formatCurrency(payment.amount)}</span>
                    {" "}nhưng thực nhận{" "}
                    <span className="font-bold">{formatCurrency(webhook.transferAmount)}</span>.
                  </p>
                  {amountDiff > 0 ? (
                    <p className="mt-1 font-semibold">
                      → Thừa: +{formatCurrency(amountDiff)} — Cần hoàn lại cho khách hàng.
                    </p>
                  ) : (
                    <p className="mt-1 font-semibold">
                      → Thiếu: {formatCurrency(amountDiff)} — Cần yêu cầu khách thanh toán thêm.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Grid 2 cột trên màn lớn */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Card: Thông tin hóa đơn */}
              <Card icon={<FileText className="h-4 w-4" />} title="Thông tin hóa đơn">
                <InfoRow label="Mã giao dịch"    value={payment.orderCode.toUpperCase()} mono />
                <InfoRow label="Nội dung CK"     value={payment.transferContent} mono />
                <InfoRow
                  label="Số tiền hóa đơn"
                  value={
                    <span className="font-bold text-primary text-lg">
                      {formatCurrency(payment.amount)}
                    </span>
                  }
                />
                <InfoRow label="Trạng thái" value={<PaymentStatusBadge status={payment.status} />} />
                <InfoRow label="Ngày tạo"      value={safeFormatDate(payment.createdAt)} />
                {payment.paidAt && (
                  <InfoRow label="Ngày thanh toán" value={safeFormatDate(payment.paidAt)} />
                )}
              </Card>

              {/* Card: Thông tin chuyển khoản SePay */}
              <Card icon={<Landmark className="h-4 w-4" />} title="Chuyển khoản thực tế (SePay)">
                {webhook ? (
                  <>
                    <InfoRow label="Ngân hàng"       value={<span className="font-bold">{webhook.gateway}</span>} />
                    <InfoRow label="Số tài khoản"    value={webhook.accountNumber} mono />
                    <InfoRow label="Mã GD ngân hàng" value={webhook.referenceCode} mono />
                    <InfoRow label="Nội dung GD"     value={webhook.content} />
                    <InfoRow
                      label="Số tiền thực nhận"
                      value={
                        <span className={hasMismatch ? "font-bold text-red-600 text-lg" : "font-bold text-green-600 text-lg"}>
                          {formatCurrency(webhook.transferAmount)}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Loại GD"
                      value={
                        <Badge variant="secondary">
                          {webhook.transferType === "in" ? "Tiền vào" : "Tiền ra"}
                        </Badge>
                      }
                    />
                    <InfoRow label="Thời gian GD" value={safeFormatDate(webhook.transactionDate)} />
                    {webhook.description && (
                      <InfoRow label="Mô tả" value={webhook.description} />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-2">
                    Chưa có dữ liệu webhook — Khách hàng chưa thực hiện chuyển khoản.
                  </p>
                )}
              </Card>

              {/* Card: Thông tin khách hàng */}
              <Card icon={<User className="h-4 w-4" />} title="Thông tin khách hàng">
                <InfoRow
                  label={<IconLabel icon={<User className="h-3.5 w-3.5" />} text="Người đặt" />}
                  value={<span className="font-semibold">{recruiter?.name || "N/A"}</span>}
                />
                <InfoRow
                  label={<IconLabel icon={<Mail className="h-3.5 w-3.5" />} text="Email" />}
                  value={
                    recruiter?.email ? (
                      <div className="flex items-center gap-1.5">
                        <a href={`mailto:${recruiter.email}`} className="text-blue-600 hover:underline text-sm">
                          {recruiter.email}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(recruiter.email);
                            setCopiedEmail(true);
                            setTimeout(() => setCopiedEmail(false), 2000);
                          }}
                          className="text-muted-foreground hover:text-foreground transition p-0.5 rounded"
                          title="Copy email"
                        >
                          {copiedEmail
                            ? <Check className="h-3.5 w-3.5 text-green-500" />
                            : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ) : "N/A"
                  }
                />

                {/* Nút gửi email - mở email client */}
                {recruiter?.email && (
                  <a
                    href={`mailto:${recruiter.email}?subject=Liên hệ về giao dịch thanh toán quảng cáo ${payment?.orderCode ?? ""}`}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-md border border-primary/40 text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Gửi email liên hệ
                  </a>
                )}

                <Separator />
                <InfoRow
                  label={<IconLabel icon={<Building2 className="h-3.5 w-3.5" />} text="Tên công ty" />}
                  value={<span className="font-semibold">{company?.name || "N/A"}</span>}
                />
                {company?.taxCode && (
                  <InfoRow
                    label={<IconLabel icon={<CreditCard className="h-3.5 w-3.5" />} text="Mã số thuế" />}
                    value={company.taxCode}
                    mono
                  />
                )}
              </Card>

              {/* Card: Đơn quảng cáo liên quan */}
              {booking && (
                <Card icon={<Calendar className="h-4 w-4" />} title="Đơn quảng cáo liên quan">
                  <InfoRow label="Mã Booking"     value={booking._id.slice(-8).toUpperCase()} mono />
                  <InfoRow
                    label="Loại hiển thị"
                    value={booking.adType === "NON_DISMISSIBLE" ? "Không thể tắt" : "Có thể tắt (Skip)"}
                  />
                  {booking.startAt && booking.endAt && (
                    <InfoRow
                      label="Thời gian chạy"
                      value={`${safeFormatDate(booking.startAt, "dd/MM/yyyy")} → ${safeFormatDate(booking.endAt, "dd/MM/yyyy")}`}
                    />
                  )}
                  <InfoRow
                    label="Trạng thái booking"
                    value={<BookingStatusBadge status={booking.status} />}
                  />
                </Card>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

//- Card section
function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b pb-3">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

//- Icon + label nhỏ gọn
function IconLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      {text}
    </span>
  );
}

//- Row label - value
function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

//- Badge trạng thái thanh toán
function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Chờ thanh toán</Badge>;
    case "PAID":
      return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Khớp tiền ✓</Badge>;
    case "FAILED":
      return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Sai tiền ✗</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

//- Badge trạng thái booking
function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING_PAYMENT: { label: "Chờ thanh toán",     className: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    SCHEDULED:       { label: "Đã xếp lịch",        className: "text-blue-600 bg-blue-50 border-blue-200" },
    RUNNING:         { label: "Đang chạy",           className: "text-green-600 bg-green-50 border-green-200" },
    COMPLETED:       { label: "Hoàn thành",          className: "text-gray-600 bg-gray-50 border-gray-200" },
    CANCELLED:       { label: "Đã hủy (Sai tiền)",  className: "text-red-600 bg-red-50 border-red-200" },
    EXPIRED:         { label: "Hết hạn",             className: "text-orange-600 bg-orange-50 border-orange-200" },
  };
  const cfg = map[status];
  return cfg
    ? <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
    : <Badge variant="outline">{status}</Badge>;
}
