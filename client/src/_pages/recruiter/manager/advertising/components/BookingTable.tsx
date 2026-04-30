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

interface BookingTableProps {
  bookings: AdBookingResType[];
  onPay: (booking: AdBookingResType) => void;
}

export default function BookingTable({ bookings, onPay }: BookingTableProps) {
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
      case "WAITING_SLOT":
        return (
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-500 bg-blue-50"
          >
            Chờ vị trí
          </Badge>
        );
      case "ACTIVE":
        return <Badge className="bg-green-500">Đang chạy</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Đã kết thúc</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="pl-6">Thông tin đơn</TableHead>
          <TableHead>Thời gian</TableHead>
          <TableHead>Tổng tiền</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right pr-6">Thao tác</TableHead>
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
                  <span className="text-sm font-medium">{booking.slotCode}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {booking.adType}
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
                    ({dayjs(booking.endAt).diff(dayjs(booking.startAt), "day")} ngày)
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-bold text-primary">
                {booking.amount.toLocaleString("vi-VN")}đ
              </TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell className="text-right pr-6">
                <div className="flex justify-end gap-2">
                  {booking.status === "PENDING_PAYMENT" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-primary text-primary hover:bg-primary/5 shadow-sm"
                      onClick={() => onPay(booking)}
                    >
                      <QrCode className="w-3.5 h-3.5" /> Thanh toán
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
