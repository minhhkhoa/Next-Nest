"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSetHotJob } from "@/queries/useJob";
import { IssueResType } from "@/schemasvalidation/issue";
import { useGetJobDetail } from "@/queries/useJob";
import { Loader2, Flame } from "lucide-react";
import React, { useEffect, useState } from "react";
import SoftSuccessSonner from "@/components/shadcn-studio/sonner/SoftSuccessSonner";
import SoftDestructiveSonner from "@/components/shadcn-studio/sonner/SoftDestructiveSonner";
import { addDays, format } from "date-fns";

interface RequestHotJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IssueResType;
}

export function RequestHotJobModal({
  open,
  onOpenChange,
  data,
}: RequestHotJobModalProps) {
  const [isHot, setIsHot] = useState(false);
  const [hotUntil, setHotUntil] = useState<string>("");
  const jobId = data?.targetId || "";

  // Fetch job detail to see current status
  const { data: jobDetail, isLoading: isLoadingJob } = useGetJobDetail(jobId);
  const setHotMutation = useSetHotJob();

  useEffect(() => {
    if (jobDetail && jobDetail.data) {
      const job = jobDetail.data; // Access the actual job data
      if (job.isHot?.isHotJob) {
        setIsHot(true);
        if (job.isHot.hotUntil) {
          setHotUntil(format(new Date(job.isHot.hotUntil), "yyyy-MM-dd"));
        } else {
          // Default 7 days if not set
          setHotUntil(format(addDays(new Date(), 7), "yyyy-MM-dd"));
        }
      } else {
        setIsHot(false);
        // Default to hot for 7 days from now
        setHotUntil(format(addDays(new Date(), 7), "yyyy-MM-dd"));
      }
    } else {
      // Fallback default
      setHotUntil(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    }
  }, [jobDetail, open]);

  const handleSave = async () => {
    if (!jobId) {
      SoftDestructiveSonner("Không tìm thấy Job ID trong Issue này!");
      return;
    }

    try {
      await setHotMutation.mutateAsync({
        jobId,
        isHot,
        hotUntil: isHot ? new Date(hotUntil).toISOString() : undefined,
        issueId: data?._id,
      });

      SoftSuccessSonner("Cập nhật trạng thái Hot Job thành công!");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      SoftDestructiveSonner("Cập nhật thất bại!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Xử lý yêu cầu Hot Job
          </DialogTitle>
        </DialogHeader>

        {isLoadingJob ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="bg-muted p-3 rounded-md text-sm space-y-2">
              <p>
                <strong>Tiêu đề Issue:</strong>{" "}
                {data?.title?.vi || data?.title?.en}
              </p>
              <p>
                <strong>Mô tả yêu cầu:</strong>{" "}
                {data?.description?.vi || data?.description?.en}
              </p>
              {jobDetail && (
                <p>
                  <strong>Job hiện tại:</strong>{" "}
                  {jobDetail.data?.title.vi || jobDetail.data?.title.en}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
              <div className="flex flex-col gap-1 text-left">
                <Label htmlFor="is-hot" className="font-medium cursor-pointer">
                  Kích hoạt Hot Job
                </Label>
                <span className="font-normal text-xs text-muted-foreground">
                  Công việc sẽ được hiển thị nổi bật trên trang chủ
                </span>
              </div>
              <Switch
                id="is-hot"
                checked={isHot}
                onCheckedChange={(checked) => setIsHot(checked)}
              />
            </div>

            {isHot && (
              <div className="space-y-2">
                <Label htmlFor="hot-until">Hot đến ngày</Label>
                <Input
                  id="hot-until"
                  type="date"
                  value={hotUntil}
                  onChange={(e) => setHotUntil(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={setHotMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button onClick={handleSave} disabled={setHotMutation.isPending}>
            {setHotMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
