"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AdBookingResType,
  AdPaymentResType,
} from "@/schemasvalidation/adBooking";
import { CheckCircle2, Copy, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useAppStore } from "./TanstackProvider";
import { ScrollArea } from "./ui/scroll-area";
import { envConfig } from "../../config";
import { useCancelByUserMutation } from "@/queries/useAdBooking";

interface AdPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: AdBookingResType | null;
  payment: AdPaymentResType | null;
  onSuccess?: () => void;
}

export default function AdPaymentModal({
  isOpen,
  onClose,
  booking,
  payment,
  onSuccess,
}: AdPaymentModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const { socket } = useAppStore();
  const { mutateAsync: cancelBookingMutation, isPending: isCancelling } = useCancelByUserMutation();

  const baseUrl = envConfig.NEXT_PUBLIC_SEPAY_BASE_URL;
  const account = envConfig.NEXT_PUBLIC_SEPAY_ACCOUNT;
  const bank = envConfig.NEXT_PUBLIC_SEPAY_BANK;

  useEffect(() => {
    if (!socket || !payment) return;

    //- Lắng nghe sự kiện thanh toán thành công từ Socket
    //- Backend sẽ emit sự kiện này khi webhook xử lý thành công
    const handlePaymentSuccess = (data: { paymentId: string }) => {
      if (data.paymentId === payment._id) {
        setIsSuccess(true);
        toast.success("Thanh toán thành công!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      }
    };

    const handlePaymentCancelled = (data: { paymentId: string }) => {
      if (data.paymentId === payment._id) {
        setIsCancelled(true);
        toast.error("Đơn hàng đã bị hủy hoặc hết hạn thanh toán!");
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    };

    socket.on("payment-success", handlePaymentSuccess);
    socket.on("payment-cancelled", handlePaymentCancelled);

    return () => {
      socket.off("payment-success", handlePaymentSuccess);
      socket.off("payment-cancelled", handlePaymentCancelled);
    };
  }, [socket, payment, onSuccess, onClose]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    try {
      await cancelBookingMutation(booking._id);
      setIsCancelled(true);
      toast.success("Đã hủy đơn quảng cáo thành công.");
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hủy đơn hàng");
    }
  };

  if (!booking || !payment) return null;

  //- SePay QR API URL
  const qrUrl = `${baseUrl}/img?acc=${account}&bank=${bank}&amount=${payment.amount}&des=${payment.transferContent}`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          //- Nếu chưa thành công và chưa hủy mà đóng thì hỏi
          if (!isSuccess && !isCancelled) {
            const confirm = window.confirm(
              "Bạn có chắc chắn muốn thoát? Đơn hàng sẽ bị hủy.",
            );
            if (confirm) {
              handleCancelBooking();
            }
          } else {
            onClose();
          }
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[550px] p-0 overflow-hidden"
        onInteractOutside={(e) => {
          if (!isSuccess && !isCancelled) e.preventDefault();
        }}
      >
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-center">
                {isSuccess
                  ? "Thanh toán thành công"
                  : isCancelled
                    ? "Đã hủy thanh toán"
                    : "Thanh toán quảng cáo"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {isSuccess
                  ? "Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi."
                  : isCancelled
                    ? "Đơn hàng này đã bị hủy và không còn hiệu lực."
                    : "Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới."}
              </DialogDescription>
            </DialogHeader>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <CheckCircle2 className="w-20 h-20 text-green-500 animate-in zoom-in duration-300" />
                <p className="text-lg font-medium text-center">
                  Hệ thống đã nhận được thanh toán. <br />
                  Quảng cáo của bạn đang được xử lý.
                </p>
                <Button onClick={onClose} className="w-full">
                  Đóng
                </Button>
              </div>
            ) : isCancelled ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <XCircle className="w-20 h-20 text-red-500 animate-in zoom-in duration-300" />
                <p className="text-lg font-medium text-center text-red-600">
                  Đơn hàng đã bị hủy. <br />
                  Bạn có thể tạo lại đơn quảng cáo mới lúc khác.
                </p>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Đóng
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="flex justify-center bg-white p-4 rounded-xl border-2 border-dashed border-primary/20">
                  <div className="relative w-[250px] h-[250px]">
                    <Image
                      src={qrUrl}
                      alt="QR Code thanh toán SePay"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-muted/50 p-4 rounded-lg text-sm">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Ngân hàng:</span>
                    <span className="font-bold">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">0387023308</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard("0387023308", "số tài khoản")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">
                      Chủ tài khoản:
                    </span>
                    <span className="font-bold uppercase">
                      NGUYEN MINH KHOA
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {payment.amount.toLocaleString("vi-VN")} VND
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(payment.amount.toString(), "số tiền")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Nội dung chuyển khoản:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {payment.transferContent}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(payment.transferContent, "nội dung")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang chờ hệ thống xác nhận giao dịch...
                </div>

                <div className="text-[12px] text-red-600 bg-red-50 p-3 rounded border border-red-100 font-medium text-center">
                  Cảnh báo: Nếu bạn không thanh toán trong vòng 15 phút hoặc
                  đóng bảng này, đơn hàng sẽ bị coi như Đã Hủy và nhường quyền
                  đặt lịch cho người khác.
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Tôi muốn hủy thanh toán đơn này
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
