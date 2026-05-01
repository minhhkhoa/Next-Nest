"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdBookingResType } from "@/schemasvalidation/adBooking";
import { Calendar, MoreHorizontal, QrCode, Eye, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdvertisingColumnProps {
  onPay: (booking: AdBookingResType) => void;
  onView: (booking: AdBookingResType) => void;
  onDelete: (booking: AdBookingResType) => void;
}

export const getAdvertisingColumns = ({
  onPay,
  onView,
  onDelete,
}: AdvertisingColumnProps): ColumnDef<AdBookingResType>[] => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return (
          <Badge
            variant="outline"
            className="text-orange-500 border-orange-500 bg-orange-50"
          >
            Chờ thanh toán
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-500 bg-blue-50"
          >
            Đã lên lịch
          </Badge>
        );
      case "RUNNING":
        return <Badge className="bg-green-500">Đang chạy</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Đã kết thúc</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Hết hạn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const canDelete = (status: string) => {
    return ["CANCELLED", "EXPIRED", "PENDING_PAYMENT"].includes(status);
  };

  return [
    {
      accessorKey: "info",
      header: "Thông tin đơn",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-primary">
              {booking._id.slice(-8).toUpperCase()}
            </span>
            <span className="text-sm font-medium">{booking.slotCode}</span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {booking.adType === "NON_DISMISSIBLE"
                ? "Không thể tắt"
                : "Có thể tắt (Skip)"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "time",
      header: "Thời gian",
      cell: ({ row }) => {
        const booking = row.original;
        const days = dayjs(booking.endAt).diff(dayjs(booking.startAt), "day");
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {dayjs(booking.startAt).format("DD/MM/YY")} -{" "}
              {dayjs(booking.endAt).format("DD/MM/YY")}
            </div>
            <span className="text-[10px] text-muted-foreground italic pl-5">
              ({days} ngày)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Tổng tiền",
      cell: ({ row }) => {
        return (
          <span className="font-bold text-primary">
            {row.original.amount.toLocaleString("vi-VN")}đ
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        return getStatusBadge(row.original.status);
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {booking.status === "PENDING_PAYMENT" && (
                  <DropdownMenuItem onClick={() => onPay(booking)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>Thanh toán</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onView(booking)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
                {canDelete(booking.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(booking)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
