"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdPaymentDetailResType } from "@/schemasvalidation/adPayment";
import { Link } from "@/i18n/navigation";

//- Hàm format tiền VND
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

//- Hàm format ngày tháng an toàn chống crash React
const safeFormatDate = (dateStr: any, formatStr: string = "dd/MM/yyyy") => {
  try {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatStr);
  } catch (error) {
    console.log("error: ", error);
    return "N/A";
  }
};

export const getAdPaymentColumns = (): ColumnDef<AdPaymentDetailResType>[] => [
  {
    id: "orderCode",
    header: () => <span className="!ml-5">Mã Giao Dịch</span>,
    cell: ({ row }) => {
      return (
        <span className="text-xs font-semibold !ml-5 block">
          {row.original.orderCode.toUpperCase()}
        </span>
      );
    },
  },
  {
    id: "company",
    header: "Khách Hàng (Doanh nghiệp)",
    cell: ({ row }) => {
      const booking = row.original.bookingId;

      //- Kiểm tra an toàn booking có phải object đã được populate hay không
      const isBookingObject =
        booking && typeof booking === "object" && "_id" in booking;
      const company = isBookingObject ? (booking as any).companyId : null;
      const recruiter = isBookingObject ? (booking as any).recruiterId : null;

      return (
        <div className="space-y-1">
          <div className="font-medium text-sm text-foreground">
            {company?.name || "N/A"}
          </div>
          <div className="text-xs text-muted-foreground">
            Người đặt: {recruiter?.name || "N/A"}
          </div>
        </div>
      );
    },
  },
  {
    id: "amount",
    header: "Số Tiền Hóa Đơn",
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium">
          {formatCurrency(row.original.amount)}
        </span>
      );
    },
  },
  {
    id: "transferAmount",
    header: "Thực Chuyển",
    cell: ({ row }) => {
      const webhookPayload = row.original.webhookPayload;
      const amount = row.original.amount;
      const status = row.original.status;

      if (!webhookPayload) {
        return (
          <span className="text-sm text-muted-foreground">
            Chưa có giao dịch
          </span>
        );
      }

      const transferAmount = webhookPayload.transferAmount;
      const diff = transferAmount - amount;

      //- Nếu trạng thái là FAILED hoặc số tiền thực chuyển khác số tiền hóa đơn
      if (status === "FAILED" || diff !== 0) {
        return (
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block">
              {formatCurrency(transferAmount)}
            </span>
            <div className="text-[10px] text-red-500 font-medium">
              {diff > 0
                ? `Thừa: +${formatCurrency(diff)}`
                : `Thiếu: ${formatCurrency(diff)}`}
            </div>
          </div>
        );
      }

      return (
        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 inline-block">
          {formatCurrency(transferAmount)}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Đối Soát",
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case "PENDING":
          return (
            <Badge
              variant="outline"
              className="text-yellow-600 bg-yellow-50 border-yellow-200"
            >
              Chờ thanh toán
            </Badge>
          );
        case "PAID":
          return (
            <Badge
              variant="outline"
              className="text-green-600 bg-green-50 border-green-200"
            >
              Khớp tiền (Thành công)
            </Badge>
          );
        case "FAILED":
          return (
            <Badge
              variant="outline"
              className="text-red-600 bg-red-50 border-red-200 animate-pulse"
            >
              Sai tiền (Thất bại)
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    id: "paymentDate",
    header: "Thời Gian Giao Dịch",
    cell: ({ row }) => {
      const dateStr = row.original.paidAt || row.original.createdAt;
      return (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {safeFormatDate(dateStr, "HH:mm dd/MM/yyyy")}
        </span>
      );
    },
  },
  {
    id: "contact",
    header: "Liên Hệ Nhà Tuyển Dụng",
    cell: ({ row }) => {
      const booking = row.original.bookingId;

      //- Kiểm tra an toàn booking có phải object đã được populate hay không
      const isBookingObject =
        booking && typeof booking === "object" && "_id" in booking;
      const recruiter = isBookingObject ? (booking as any).recruiterId : null;

      if (!recruiter)
        return <span className="text-xs text-muted-foreground">N/A</span>;

      return (
        <div className="space-y-0.5 text-xs">
          <div className="text-muted-foreground">{recruiter.email}</div>
          {recruiter.phoneNumber && (
            <div className="font-medium text-foreground">
              {recruiter.phoneNumber}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Thao Tác",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <Link href={`/admin/advertising/payments/${payment._id}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs font-medium"
          >
            <Eye className="h-3.5 w-3.5" />
            Chi tiết
          </Button>
        </Link>
      );
    },
  },
];
