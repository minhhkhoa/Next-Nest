"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdBookingResType } from "@/schemasvalidation/adBooking";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: AdBookingResType | null;
}

export function AdvertisingDetailModal({ isOpen, onClose, data }: Props) {
  if (!data) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 bg-yellow-50 border-yellow-200"
          >
            Chờ thanh toán
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge
            variant="outline"
            className="text-blue-600 bg-blue-50 border-blue-200"
          >
            Đã xếp lịch
          </Badge>
        );
      case "RUNNING":
        return (
          <Badge
            variant="outline"
            className="text-green-600 bg-green-50 border-green-200"
          >
            Đang chạy
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="text-gray-600 bg-gray-50 border-gray-200"
          >
            Hoàn thành
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="text-red-600 bg-red-50 border-red-200"
          >
            Đã hủy
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 bg-orange-50 border-orange-200"
          >
            Hết hạn
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết đơn quảng cáo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Mã Booking:</span>
            <span className="font-semibold uppercase">
              {data._id.substring(data._id.length - 8)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Vị trí:</span>
            <Badge variant="secondary" className="text-base">
              {data.slotCode}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Thời gian:</span>
            <span className="font-medium">
              {format(new Date(data.startAt), "dd/MM/yyyy")} -{" "}
              {format(new Date(data.endAt), "dd/MM/yyyy")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trạng thái:</span>
            {getStatusBadge(data.status)}
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground mb-2">Thông tin khách hàng:</p>
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Công ty:</span>
                <span className="text-sm font-medium">
                  {(data.companyId as any)?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Người đặt:</span>
                <span className="text-sm font-medium">
                  {(data.recruiterId as any)?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
