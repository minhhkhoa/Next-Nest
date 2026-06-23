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

import { useTranslations } from "next-intl";

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
  const t = useTranslations("Candidate.MyApplication");
  const tCommon = useTranslations("Common");

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => applicationApiRequest.remove(id),
    onSuccess: () => {
      toast.success(t("WithdrawSuccess"));
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          t("WithdrawError"),
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
          <DialogTitle>{t("ConfirmWithdrawTitle")}</DialogTitle>
          <DialogDescription>
            {t.rich("ConfirmWithdrawDesc", {
              jobTitle: () => <strong>{jobTitle}</strong>,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {tCommon("Buttons.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("ConfirmWithdrawBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
