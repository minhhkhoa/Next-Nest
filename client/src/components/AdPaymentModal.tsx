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
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useAppStore } from "./TanstackProvider";
import { ScrollArea } from "./ui/scroll-area";
import { envConfig } from "../../config";

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
  const { socket } = useAppStore();

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

    socket.on("payment-success", handlePaymentSuccess);

    return () => {
      socket.off("payment-success", handlePaymentSuccess);
    };
  }, [socket, payment, onSuccess, onClose]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  if (!booking || !payment) return null;

  //- SePay QR API URL
  const qrUrl = `${baseUrl}/img?acc=${account}&bank=${bank}&amount=${payment.amount}&des=${payment.transferContent}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-center">
                {isSuccess ? "Thanh toán thành công" : "Thanh toán quảng cáo"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {isSuccess
                  ? "Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi."
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

                <div className="text-[10px] text-muted-foreground bg-yellow-50 p-2 rounded border border-yellow-100 italic">
                  * Vui lòng chuyển đúng số tiền và nội dung để được xác nhận tự
                  động trong 1-3 phút.
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
