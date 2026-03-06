"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import applicationApiRequest from "@/apiRequest/application";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  jobTitle: string;
}

export default function CancelApplicationAlertDialog({
  open,
  onOpenChange,
  applicationId,
  jobTitle,
}: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => applicationApiRequest.remove(id),
    onSuccess: () => {
      toast.success("Rút đơn ứng tuyển thành công");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi rút đơn, vui lòng thử lại",
      );
    },
  });

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    mutate(applicationId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận rút đơn ứng tuyển</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn rút lại đơn ứng tuyển cho vị trí{" "}
            <strong>{jobTitle}</strong> không? Hành động này không thể hoàn tác,
            nhà tuyển dụng sẽ không còn thấy hồ sơ của bạn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận rút đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
