"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdSlotResType } from "@/schemasvalidation/adSlot";
import AdCalendarPicker from "./AdCalendarPicker";
import { useGetBusyDatesQuery } from "@/queries/useAdBooking";
import { useMemo, useState } from "react";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface BookingFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: AdSlotResType | null;
  formData: {
    adType: string;
    imageUrl: string;
    targetUrl: string;
    startAt: string;
    duration: number;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export default function BookingFormDrawer({
  isOpen,
  onClose,
  selectedSlot,
  formData,
  setFormData,
  onSubmit,
  isPending,
}: BookingFormDrawerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  //- Lấy lịch bận của slot này
  const { data: busyDatesRes, isLoading: isLoadingBusy } = useGetBusyDatesQuery(
    selectedSlot?.code || "",
    isOpen,
  );

  const busyDates = busyDatesRes?.data || [];

  //- Kiểm tra xung đột lịch (Client-side validation)
  const isConflict = useMemo(() => {
    if (!formData.startAt || !formData.duration || busyDates.length === 0)
      return false;

    const start = startOfDay(new Date(formData.startAt));
    const end = addDays(start, formData.duration - 1);

    const intervals = busyDates.map((b) => ({
      start: startOfDay(new Date(b.startAt)),
      end: startOfDay(new Date(b.endAt)),
    }));

    for (let i = 0; i < formData.duration; i++) {
      const currentDay = addDays(start, i);
      if (
        intervals.some((interval) => isWithinInterval(currentDay, interval))
      ) {
        return true;
      }
    }
    return false;
  }, [formData.startAt, formData.duration, busyDates]);

  //- Xử lý Upload ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      if (url) {
        setFormData({ ...formData, imageUrl: url });
        if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
        toast.success("Tải ảnh lên thành công");
      }
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startAt) {
      newErrors.startAt = "Vui lòng chọn ngày bắt đầu chạy quảng cáo.";
    } else if (isConflict) {
      newErrors.startAt =
        "Khoảng thời gian này đã bị trùng lịch, vui lòng chọn ngày khác.";
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = "Vui lòng tải lên hình ảnh quảng cáo.";
    }

    if (!formData.targetUrl) {
      newErrors.targetUrl = "Vui lòng nhập link điều hướng (Target URL).";
    } else {
      try {
        const url = new URL(formData.targetUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          newErrors.targetUrl = "Link phải bắt đầu bằng http:// hoặc https://";
        }
      } catch (_) {
        newErrors.targetUrl =
          "Định dạng link không hợp lệ (Ví dụ: https://example.com)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit();
  };

  if (!selectedSlot) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[550px] overflow-y-auto px-5">
        <SheetHeader className="border-b pb-4 mb-6">
          <SheetTitle className="text-2xl font-bold">
            Thiết lập quảng cáo
          </SheetTitle>
          <SheetDescription>
            Đang cấu hình cho vị trí:{" "}
            <span className="font-bold text-primary">{selectedSlot.name}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-4">
          {/* Chế độ hiển thị */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Chế độ hiển thị</Label>
            <Select
              disabled={selectedSlot.adModeAllowed !== "BOTH"}
              value={formData.adType}
              onValueChange={(v) => setFormData({ ...formData, adType: v })}
            >
              <SelectTrigger
                className={
                  selectedSlot.adModeAllowed !== "BOTH" ? "bg-muted/50" : "h-11"
                }
              >
                <SelectValue placeholder="Chọn loại quảng cáo" />
              </SelectTrigger>
              <SelectContent>
                {selectedSlot.adModeAllowed !== "DISMISSIBLE" && (
                  <SelectItem value="NON_DISMISSIBLE">
                    Cố định (Ưu tiên hiển thị)
                  </SelectItem>
                )}
                {selectedSlot.adModeAllowed !== "NON_DISMISSIBLE" && (
                  <SelectItem value="DISMISSIBLE">
                    Có thể đóng (Nút x)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Lịch và Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Ngày bắt đầu</Label>
              <AdCalendarPicker
                date={formData.startAt ? new Date(formData.startAt) : undefined}
                setDate={(date) => {
                  setFormData({ ...formData, startAt: date?.toISOString() });
                  if (errors.startAt) setErrors({ ...errors, startAt: "" });
                }}
                busyDates={busyDates}
                duration={formData.duration}
                maxDuration={selectedSlot.maxDurationDays}
              />
              {errors.startAt && (
                <p className="text-[12px] text-destructive font-medium">
                  {errors.startAt}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">
                Số ngày chạy (Max: {selectedSlot.maxDurationDays})
              </Label>
              <Input
                type="number"
                className="h-11"
                min={1}
                max={selectedSlot.maxDurationDays}
                value={formData.duration}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 1;
                  if (val > selectedSlot.maxDurationDays)
                    val = selectedSlot.maxDurationDays;
                  setFormData({ ...formData, duration: val });
                }}
              />
            </div>
          </div>

          {/* Upload Ảnh */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Hình ảnh quảng cáo</Label>
            <div className="relative group">
              {formData.imageUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted">
                  <Image
                    width={selectedSlot.width}
                    height={selectedSlot.height}
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Đang tải lên...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <Upload className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">
                        Nhấn để tải ảnh lên
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Kích thước đề xuất: {selectedSlot.width}x
                        {selectedSlot.height}px
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            {errors.imageUrl && (
              <p className="text-[12px] text-destructive font-medium">
                {errors.imageUrl}
              </p>
            )}
          </div>

          {/* Link đích */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">
              Link điều hướng (Target URL)
            </Label>
            <Input
              className="h-11"
              placeholder="https://example.com/promotion"
              value={formData.targetUrl}
              onChange={(e) => {
                setFormData({ ...formData, targetUrl: e.target.value });
                if (errors.targetUrl) setErrors({ ...errors, targetUrl: "" });
              }}
            />
            {errors.targetUrl && (
              <p className="text-[12px] text-destructive font-medium">
                {errors.targetUrl}
              </p>
            )}
          </div>

          {/* Tổng tiền */}
          <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 space-y-3 mt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Đơn giá vị trí:</span>
              <span className="font-medium text-foreground">
                {selectedSlot.pricePerDay.toLocaleString("vi-VN")}đ / ngày
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground border-b border-primary/10 pb-2">
              <span>Thời gian:</span>
              <span className="font-medium text-foreground">
                {formData.duration} ngày
              </span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-1">
              <span>Tổng cộng:</span>
              <span className="text-primary">
                {(selectedSlot.pricePerDay * formData.duration).toLocaleString(
                  "vi-VN",
                )}{" "}
                VND
              </span>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-3 sm:flex-col">
          <Button
            onClick={handleSubmit}
            disabled={isPending || isLoadingBusy || isUploading}
            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang khởi tạo đơn...
              </>
            ) : (
              "Tạo đơn & Thanh toán"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            Đóng bảng thiết lập
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
