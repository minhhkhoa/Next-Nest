"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, QrCode, Eye } from "lucide-react";
import dayjs from "dayjs";
import { AdBookingResType } from "@/schemasvalidation/adBooking";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface BookingTableProps {
  bookings: AdBookingResType[];
  onPay: (booking: AdBookingResType) => void;
  onView: (booking: AdBookingResType) => void;
  onDelete: (booking: AdBookingResType) => void;
}

export default function BookingTable({
  bookings,
  onPay,
  onView,
  onDelete,
}: BookingTableProps) {
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

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="pl-6">Thông tin đơn</TableHead>
          <TableHead>Thời gian</TableHead>
          <TableHead>Tổng tiền</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right pr-6 w-[100px]">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-20 text-muted-foreground italic"
            >
              Bạn chưa có đơn đặt quảng cáo nào.
            </TableCell>
          </TableRow>
        ) : (
          bookings.map((booking) => (
            <TableRow
              key={booking._id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="pl-6">
                <div className="flex flex-col">
                  <span className="font-bold text-primary">
                    {booking._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">
                    {booking.slotId?.code || "N/A"}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {booking.adType === "NON_DISMISSIBLE"
                      ? "Không thể tắt"
                      : "Có thể tắt (Skip)"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {dayjs(booking.startAt).format("DD/MM/YY")} -{" "}
                    {dayjs(booking.endAt).format("DD/MM/YY")}
                  </div>
                  <span className="text-[10px] text-muted-foreground italic pl-5">
                    ({dayjs(booking.endAt).diff(dayjs(booking.startAt), "day")}{" "}
                    ngày)
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-bold text-primary">
                {booking.amount.toLocaleString("vi-VN")}đ
              </TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell className="text-right pr-6">
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
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
