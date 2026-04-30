"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, CreditCard, History } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

//- Data Queries
import {
  useGetAdBookingsQuery,
  useCreateAdBookingMutation,
} from "@/queries/useAdBooking";
import { useGetAdSlotsPublic } from "@/queries/useAdSlot";

//- Components
import AdPaymentModal from "@/components/AdPaymentModal";
import StatusModal, { StatusType } from "./components/StatusModal";
import AdSlotCard from "./components/AdSlotCard";
import BookingFormDrawer from "./components/BookingFormDrawer";
import BookingTable from "./components/BookingTable";
import StatsCards from "./components/StatsCards";

//- Types
import {
  AdBookingResType,
  AdPaymentResType,
} from "@/schemasvalidation/adBooking";
import { AdSlotResType } from "@/schemasvalidation/adSlot";

export default function AdvertisingPage() {
  //- Queries
  const { data: bookingsRes, refetch } = useGetAdBookingsQuery();
  const { data: slotsRes } = useGetAdSlotsPublic();
  const createBookingMutation = useCreateAdBookingMutation();

  //- Modals Visibility
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  //- Selection Data
  const [selectedBooking, setSelectedBooking] =
    useState<AdBookingResType | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<AdPaymentResType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AdSlotResType | null>(null);

  //- Status Modal Config
  const [statusConfig, setStatusConfig] = useState<{
    type: StatusType;
    title: string;
    description: string;
  }>({
    type: "success",
    title: "",
    description: "",
  });

  //- Create Form State
  const [formData, setFormData] = useState({
    adType: "NON_DISMISSIBLE",
    imageUrl: "",
    targetUrl: "",
    startAt: "",
    duration: 1,
  });

  const bookings = bookingsRes?.data || [];
  const slots = slotsRes?.data || [];

  const handleOpenCreateForm = (slot: AdSlotResType) => {
    setSelectedSlot(slot);

    //- Tự động gán adType dựa trên adModeAllowed của slot
    const defaultAdType =
      slot.adModeAllowed === "BOTH" ? "NON_DISMISSIBLE" : slot.adModeAllowed;

    setFormData({
      ...formData,
      adType: defaultAdType,
      duration: 1, // Reset về mặc định khi chọn slot mới
    });

    setIsCreateModalOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedSlot) return;

    const payload = {
      slotCode: selectedSlot.code,
      adType: formData.adType,
      imageUrl: formData.imageUrl,
      targetUrl: formData.targetUrl,
      startAt: dayjs(formData.startAt).toISOString(),
      endAt: dayjs(formData.startAt)
        .add(formData.duration, "day")
        .toISOString(),
    };

    try {
      const res = await createBookingMutation.mutateAsync(payload as any);
      if (res.data) {
        setSelectedBooking(res.data.booking);
        setSelectedPayment(res.data.payment);
        setIsCreateModalOpen(false);
        setIsPaymentModalOpen(true);
        refetch();
      }
    } catch (error) {
      toast.error("Lỗi khi tạo đơn hàng");
      console.log(error);
    }
  };

  const handlePaymentSuccess = () => {
    setStatusConfig({
      type: "success",
      title: "Thanh toán thành công!",
      description:
        "Quảng cáo của bạn đã được ghi nhận và đang chờ hiển thị theo lịch.",
    });
    setIsStatusModalOpen(true);
    refetch();
  };

  return (
    <div className="p-4 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Quảng cáo
          </h1>
          <p className="text-muted-foreground">
            Tăng khả năng tiếp cận ứng viên bằng cách xuất hiện ở những vị trí
            nổi bật nhất.
          </p>
        </div>
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="grid w-full max-w-[500px] grid-cols-3 mb-8">
          <TabsTrigger value="explore" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Khám phá
          </TabsTrigger>
          <TabsTrigger value="my-ads" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Đơn hàng
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Thống kê
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EXPLORE SLOTS */}
        <TabsContent
          value="explore"
          className="space-y-6 animate-in fade-in duration-500"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <AdSlotCard
                key={slot._id}
                slot={slot as any}
                onSelect={handleOpenCreateForm}
              />
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: MY BOOKINGS */}
        <TabsContent
          value="my-ads"
          className="animate-in slide-in-from-left duration-500"
        >
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đơn hàng</CardTitle>
              <CardDescription>
                Quản lý và theo dõi trạng thái các đơn đặt quảng cáo của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <BookingTable
                bookings={bookings}
                onPay={(b) => {
                  setSelectedBooking(b);
                  //- Logic lấy paymentId nếu cần
                  setIsPaymentModalOpen(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: STATS */}
        <TabsContent value="stats" className="animate-in zoom-in duration-500">
          <StatsCards bookings={bookings} />
        </TabsContent>
      </Tabs>

      {/* CREATE BOOKING DRAWER */}
      <BookingFormDrawer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedSlot={selectedSlot}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateBooking}
        isPending={createBookingMutation.isPending}
      />

      {/* PAYMENT MODAL */}
      <AdPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={selectedBooking}
        payment={selectedPayment}
        onSuccess={handlePaymentSuccess}
      />

      {/* STATUS MODAL */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        type={statusConfig.type}
        title={statusConfig.title}
        description={statusConfig.description}
        actionLabel="Quay lại danh sách đơn"
      />
    </div>
  );
}
