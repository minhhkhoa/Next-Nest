"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, History, CheckCircle2 } from "lucide-react";
import { AdBookingResType } from "@/schemasvalidation/adBooking";

interface StatsCardsProps {
  bookings: AdBookingResType[];
}

export default function StatsCards({ bookings }: StatsCardsProps) {
  const totalBookings = bookings.length;

  const runningCount = bookings.filter((b) => b.status === "RUNNING").length;

  const pendingScheduledCount = bookings.filter((b) =>
    ["PENDING_PAYMENT", "SCHEDULED"].includes(b.status)
  ).length;

  const totalSpent = bookings
    .reduce((acc, curr) => {
      if (["RUNNING", "SCHEDULED", "COMPLETED"].includes(curr.status)) {
        return acc + curr.amount;
      }
      return acc;
    }, 0)
    .toLocaleString("vi-VN");

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <History className="w-4 h-4" /> Tổng số đơn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalBookings}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Đơn quảng cáo đã tạo
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-green-100 bg-gradient-to-br from-green-50 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Đang hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{runningCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Đang hiển thị trên website
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <History className="w-4 h-4" /> Chờ / Sắp chạy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-500">{pendingScheduledCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Đang chờ thanh toán hoặc tới lịch
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Tổng chi phí
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalSpent}đ</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng tiền đã đầu tư thành công
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
