"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface DeleteConfirmModalProps {
  title: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function DeleteConfirmModal({
  title,
  isDeleting,
  onConfirm,
  onCancel,
  children,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-muted-foreground text-sm">
            Bạn chắc chắn muốn khóa mục này? Hành động này có thể ảnh hưởng đến
            các dữ liệu liên quan.
          </p>

          {children}
        </div>

        <DialogFooter className="!gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Đang xử lý...
              </div>
            ) : (
              "Xác nhận khóa"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}