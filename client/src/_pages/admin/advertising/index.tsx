"use client";

import React, { useState } from "react";
import { InfoIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetAdBookingsAdminQuery,
  useCancelByAdminMutation,
} from "@/queries/useAdBooking";
import { useGetAdPaymentsQuery } from "@/queries/useAdPayment";
import { AdBookingResType } from "@/schemasvalidation/adBooking";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { DeleteConfirmModal } from "../NewsCategory/components/modals/delete-confirm-modal";
import { getAdvertisingColumns } from "./advertisingColumn";
import TableAdvertising from "./tableAdvertising";
import { AdvertisingDetailModal } from "./components/advertising-detail-modal";
import { getAdPaymentColumns } from "./adPaymentColumn";
import TableAdPayment from "./tableAdPayment";

export default function AdvertisingAdminPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  //- Quản lý Modal cho AdBooking
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    data: AdBookingResType | null;
  }>({ isOpen: false, data: null });

  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    data: AdBookingResType | null;
  }>({ isOpen: false, data: null });


  //- Fetch danh sách Booking
  const {
    data: resData,
    isLoading,
    refetch,
  } = useGetAdBookingsAdminQuery({
    currentPage,
    pageSize,
  });

  //- Fetch danh sách thanh toán đối soát
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useGetAdPaymentsQuery();

  const { mutateAsync: cancelBookingMutation, isPending: isCancelling } =
    useCancelByAdminMutation();

  const handleOpenDetailModal = (booking: AdBookingResType) => {
    setDetailModal({ isOpen: true, data: booking });
  };

  const handleOpenCancelModal = (booking: AdBookingResType) => {
    setCancelModal({ isOpen: true, data: booking });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.data) return;

    try {
      const res = await cancelBookingMutation(cancelModal.data._id);

      if (res?.isError) {
        console.log("error cancel booking: ", res);
        SoftDestructiveSonner("Lỗi khi hủy đơn quảng cáo");
        return;
      }

      SoftSuccessSonner("Hủy đơn quảng cáo thành công");
      setCancelModal({ isOpen: false, data: null });
      refetch();
      //- Khi hủy booking, refetch lại cả danh sách thanh toán để cập nhật status
      refetchPayments();
    } catch (error: any) {
      SoftDestructiveSonner(error.message || "Lỗi khi hủy đơn quảng cáo");
      console.log("error cancel booking: ", error);
    }
  };

  const columns = getAdvertisingColumns(
    handleOpenDetailModal,
    handleOpenCancelModal,
  );

  const paymentColumns = getAdPaymentColumns();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="">
        <div className="mx-auto max-w-7xl pb-8 md:pt-8 ">
          <div className="flex items-center justify-between">
            <div>
              <HeaderPage />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="mb-6 bg-muted/65 p-1 rounded-lg border">
            <TabsTrigger value="bookings" className="px-4 py-2">
              Quản lý Đặt lịch
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="px-4 py-2"
              onClick={() => refetchPayments()}
            >
              Đối soát Thanh toán
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="focus-visible:outline-none">
            {/* Table Booking */}
            {!isLoading ? (
              <TableAdvertising
                data={resData?.data?.result ?? []}
                columns={columns}
                meta={
                  resData?.data?.meta ?? {
                    current: 0,
                    pageSize: 0,
                    totalPages: 0,
                    totalItems: 0,
                  }
                }
                setCurrentPage={setCurrentPage}
              />
            ) : (
              <div className="flex justify-center mt-10">
                <Spinner />
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="focus-visible:outline-none">
            {/* Table AdPayment */}
            {!isPaymentsLoading ? (
              <TableAdPayment
                data={paymentsData?.data ?? []}
                columns={paymentColumns}
              />
            ) : (
              <div className="flex justify-center mt-10">
                <Spinner />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {detailModal.isOpen && (
        <AdvertisingDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, data: null })}
          data={detailModal.data}
        />
      )}

      {cancelModal.isOpen && (
        <DeleteConfirmModal
          title="Hủy đơn quảng cáo"
          isDeleting={isCancelling}
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancelModal({ isOpen: false, data: null })}
        />
      )}

    </div>
  );
}

function HeaderPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        Quản lý{" "}
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap align-middle pb-2">
          Quảng Cáo & Thanh Toán
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition inline-flex items-center"
              >
                <InfoIcon className="h-4 w-4" color="yellow" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 font-normal text-base normal-case tracking-normal">
              <div className="space-y-3">
                <p className="font-semibold">Thông tin quản lý quảng cáo</p>

                <p className="text-sm text-muted-foreground">
                  Khu vực này hiển thị các đơn đặt chỗ quảng cáo và lịch sử giao
                  dịch ngân hàng đối soát. Bạn có thể xem chi tiết đối soát các
                  trường hợp sai lệch số tiền để hoàn trả thủ công.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </span>
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Theo dõi và quản lý các đơn đặt chỗ quảng cáo cũng như các giao dịch
        thanh toán trên hệ thống.
      </p>
    </div>
  );
}
