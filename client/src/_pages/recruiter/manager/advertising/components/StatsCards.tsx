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
  const totalSpent = bookings
    .reduce((acc, curr) => acc + (curr.status !== "CANCELLED" ? curr.amount : 0), 0)
    .toLocaleString("vi-VN");

  const pendingCount = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;
  const activeCount = bookings.filter((b) => b.status === "ACTIVE").length;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Tổng chi tiêu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{totalSpent} VND</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tính trên tất cả đơn hàng trừ đơn đã hủy
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <History className="w-4 h-4" /> Đơn chờ xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground mt-1 text-orange-500 font-medium">
            Cần thanh toán để kích hoạt
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Quảng cáo Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">{activeCount}</div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Đang hiển thị trên website
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
