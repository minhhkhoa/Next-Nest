"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetAdBookingsQuery,
  useCreateAdBookingMutation,
} from "@/queries/useAdBooking";
import { useGetAdSlotsPublic } from "@/queries/useAdSlot";
import AdPaymentModal from "@/components/AdPaymentModal";
import {
  AdBookingResType,
  AdPaymentResType,
} from "@/schemasvalidation/adBooking";
import { Info, Plus, QrCode } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

export default function AdvertisingPage() {
  const { data: bookingsRes, refetch } = useGetAdBookingsQuery();
  const { data: slotsRes } = useGetAdSlotsPublic();
  const createBookingMutation = useCreateAdBookingMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<AdBookingResType | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<AdPaymentResType | null>(null);

  const bookings = bookingsRes?.data || [];
  const slots = slotsRes?.data || [];

  const handleCreateTestBooking = async () => {
    if (slots.length === 0) {
      toast.error("Không có vị trí quảng cáo nào khả dụng");
      return;
    }

    const firstSlot = slots[0];
    const payload = {
      slotCode: firstSlot.code,
      adType: "NON_DISMISSIBLE",
      imageUrl: "https://via.placeholder.com/1200x300",
      targetUrl: "https://next-nest.com",
      startAt: dayjs().add(1, "day").toISOString(),
      endAt: dayjs().add(8, "day").toISOString(),
    };

    try {
      const res = await createBookingMutation.mutateAsync(payload);
      if (res.data) {
        setSelectedBooking(res.data.booking);
        setSelectedPayment(res.data.payment);
        setIsModalOpen(true);
        refetch();
      }
    } catch (error) {
      toast.error("Lỗi khi tạo đơn hàng");
    }
  };

  const handleShowPayment = (booking: AdBookingResType) => {
    //- Trong thực tế, booking trả về từ list có thể không kèm payment object đầy đủ
    //- Hoặc ta cần gọi 1 API lấy thông tin thanh toán của booking đó.
    //- Ở đây để demo nhanh, ta giả định status PENDING_PAYMENT và hiển thị modal
    //- Nhưng modal cần 'payment' object. Ta có thể giả lập hoặc lấy từ booking.

    //- Lưu ý: AdBookingResType có paymentId.
    toast.info("Tính năng xem lại thông tin thanh toán đang được cập nhật");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Chờ thanh toán
          </Badge>
        );
      case "PAID":
      case "WAITING_SLOT":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Đã thanh toán
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Đang hiển thị
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Quảng cáo
          </h1>
          <p className="text-muted-foreground mt-1">
            Nâng tầm thương hiệu bằng cách hiển thị quảng cáo tại các vị trí đắc
            địa.
          </p>
        </div>
        <Button onClick={handleCreateTestBooking} className="gap-2 shadow-lg">
          <Plus className="w-4 h-4" />
          Mua quảng cáo ngay
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase">
              Tổng chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings
                .reduce((sum, b) => sum + b.amount, 0)
                .toLocaleString("vi-VN")}{" "}
              VND
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase">
              Đơn đang chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === "PENDING_PAYMENT").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="py-2 text-sm font-medium text-muted-foreground uppercase">
              Đang hiển thị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đặt chỗ</CardTitle>
          <CardDescription>
            Danh sách các chiến dịch quảng cáo của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vị trí</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Chưa có dữ liệu đặt quảng cáo.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <div className="font-medium">{booking.slotCode}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.adType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {dayjs(booking.startAt).format("DD/MM/YYYY")} -{" "}
                        {dayjs(booking.endAt).format("DD/MM/YYYY")}
                      </div>
                      <div className="text-[10px] text-muted-foreground italic">
                        (
                        {dayjs(booking.endAt).diff(
                          dayjs(booking.startAt),
                          "day",
                        )}{" "}
                        ngày)
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {booking.amount.toLocaleString("vi-VN")} VND
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      {booking.status === "PENDING_PAYMENT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                          onClick={() => handleShowPayment(booking)}
                        >
                          <QrCode className="w-3 h-3" />
                          Thanh toán
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground ml-2"
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        payment={selectedPayment}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
