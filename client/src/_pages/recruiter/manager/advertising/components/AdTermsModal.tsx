"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";

interface AdTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function AdTermsModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: AdTermsModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isPending) {
        onClose();
        setAgreed(false);
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Điều khoản Dịch vụ Quảng cáo
          </DialogTitle>
          <DialogDescription>
            Vui lòng đọc kỹ các điều khoản trước khi xác nhận tạo đơn quảng cáo.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[250px] rounded-md border p-4 bg-muted/30">
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">1. Nội dung quảng cáo hợp lệ</h4>
              <p className="text-muted-foreground">
                Mọi hình ảnh (Banner) và đường dẫn (Target URL) phải tuân thủ nghiêm ngặt các quy định của pháp luật và thuần phong mỹ tục. Không chứa nội dung đồi trụy, bạo lực, phản động, hoặc quảng cáo các sản phẩm bị cấm.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">2. Vi phạm & Xử lý</h4>
              <p className="text-muted-foreground text-red-600/90 font-medium">
                Nếu phát hiện nội dung quảng cáo vi phạm:
                <br />
                - Đơn quảng cáo sẽ bị **Hủy ngay lập tức** (Chuyển sang trạng thái Đã hủy).
                <br />
                - Bạn sẽ bị mất quyền lợi hiển thị và KHÔNG được hoàn tiền.
                <br />
                - Tài khoản có thể bị cảnh cáo hoặc khóa vĩnh viễn tùy mức độ vi phạm.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">3. Trách nhiệm của khách hàng</h4>
              <p className="text-muted-foreground">
                Bạn hoàn toàn chịu trách nhiệm trước pháp luật về tính chân thực, chính xác của nội dung quảng cáo. Hệ thống Next-Nest chỉ cung cấp không gian hiển thị và không chịu trách nhiệm pháp lý về nội dung của bạn.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">4. Chính sách thanh toán & hoàn tiền</h4>
              <p className="text-muted-foreground">
                - Đơn hàng chỉ có hiệu lực sau khi thanh toán thành công trong vòng 15 phút.
                <br />
                - Không hỗ trợ hoàn tiền cho các đơn đã thanh toán thành công và xếp lịch, trừ lỗi phát sinh từ hệ thống máy chủ.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox 
            id="terms-agree" 
            checked={agreed} 
            onCheckedChange={(c) => setAgreed(c as boolean)} 
            disabled={isPending}
          />
          <label
            htmlFor="terms-agree"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Tôi đã đọc, hiểu rõ rủi ro và đồng ý với các điều khoản trên.
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!agreed || isPending}
          >
            {isPending ? "Đang tạo..." : "Xác nhận & Chuyển tới thanh toán"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
